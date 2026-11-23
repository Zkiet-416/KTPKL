import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { GoodsIssue } from './entities/goods-issue.entity';
import { GoodsIssueDetail } from './entities/goods-issue-detail.entity';
import { Product } from '../products/entities/product.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { GoodsReceipt } from '../goods-receipts/entities/goods-receipt.entity';
import { GoodsReceiptDetail } from '../goods-receipts/entities/goods-receipt-detail.entity';
import { CreateGoodsIssueDto } from './dto/create-goods-issue.dto';
import { GoodsIssueQueryDto } from './dto/goods-issue-query.dto';

@Injectable()
export class GoodsIssuesService {
  constructor(
    @InjectRepository(GoodsIssue)
    private readonly goodsIssueRepo: Repository<GoodsIssue>,

    @InjectRepository(GoodsIssueDetail)
    private readonly goodsIssueDetailRepo: Repository<GoodsIssueDetail>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    private readonly dataSource: DataSource,
  ) {}

  async findAll(queryDto: GoodsIssueQueryDto) {
    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 10;

    const query = this.goodsIssueRepo
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.createdBy', 'creator');

    if (queryDto.issueType) {
      query.andWhere('issue.type = :issueType', {
        issueType: queryDto.issueType,
      });
    }

    if (queryDto.search?.trim()) {
      query.andWhere('issue.code LIKE :search', {
        search: `%${queryDto.search.trim()}%`,
      });
    }

    query.orderBy('issue.createdAt', 'DESC');
    query.skip((page - 1) * limit).take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const issue = await this.goodsIssueRepo.findOne({
      where: { id },
      relations: ['createdBy', 'details', 'details.product'],
    });

    if (!issue) {
      throw new NotFoundException(`Không tìm thấy phiếu xuất/nhập kho với ID: ${id}`);
    }

    return issue;
  }

  async create(createDto: CreateGoodsIssueDto, userId: number) {
    const { code, issueType, note, details } = createDto;
    const supplierIdFromDto = (createDto as CreateGoodsIssueDto & { supplierId?: number }).supplierId;

    if (!details || details.length === 0) {
      throw new BadRequestException('Chi tiết phiếu xuất/nhập kho không được để trống.');
    }

    return await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(GoodsIssue, { where: { code } });
      if (existing) {
        throw new BadRequestException(`Mã phiếu "${code}" đã tồn tại.`);
      }

      const goodsIssue = manager.create(GoodsIssue, {
        code,
        type: issueType,
        note,
        createdByUserId: userId,
      });
      const savedIssue = await manager.save(GoodsIssue, goodsIssue);

      let targetSupplierId: number | null = null;
      if (issueType === 'NHAP') {
        if (supplierIdFromDto) {
          targetSupplierId = Number(supplierIdFromDto);
        } else {
          const firstSupplier = await manager.findOne(Supplier, {
            where: { isActive: true },
            order: { id: 'ASC' },
          });
          targetSupplierId = firstSupplier?.id ?? null;
        }
      }

      let receiptTotalAmount = 0;
      const receiptItems: {
        product: Product;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
      }[] = [];

      for (const item of details) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId, isActive: true },
        });

        if (!product) {
          throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${item.productId}`);
        }

        if (issueType === 'XUAT') {
          if (product.stockQuantity < item.quantity) {
            throw new BadRequestException(
              `Sản phẩm "${product.name}" (Mã: ${product.code}) không đủ tồn kho. Tồn hiện tại: ${product.stockQuantity}, yêu cầu xuất: ${item.quantity}`,
            );
          }
          product.stockQuantity -= item.quantity;
        } else if (issueType === 'NHAP') {
          product.stockQuantity += item.quantity;
          const lineTotal = Number(item.quantity) * Number(item.unitPrice);
          receiptTotalAmount += lineTotal;
          receiptItems.push({
            product,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            lineTotal,
          });
        } else {
          throw new BadRequestException(
            `Loại phiếu không hợp lệ: ${issueType}. Chỉ chấp nhận 'NHAP' hoặc 'XUAT'.`,
          );
        }

        await manager.save(Product, product);

        const detail = manager.create(GoodsIssueDetail, {
          goodsIssueId: savedIssue.id,
          goodsId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
        await manager.save(GoodsIssueDetail, detail);
      }

      if (issueType === 'NHAP' && targetSupplierId) {
        const existingReceipt = await manager.findOne(GoodsReceipt, {
          where: { receiptCode: code.slice(0, 20) },
        });

        if (!existingReceipt) {
          const receipt = manager.create(GoodsReceipt, {
            receiptCode: code.slice(0, 20),
            supplierId: targetSupplierId,
            createdByUserId: userId,
            totalAmount: receiptTotalAmount.toFixed(2),
            note: note ?? null,
          });
          const savedReceipt = await manager.save(GoodsReceipt, receipt);

          for (const rItem of receiptItems) {
            const rDetail = manager.create(GoodsReceiptDetail, {
              goodsReceiptId: savedReceipt.id,
              productId: rItem.product.id,
              unit: rItem.product.unit || 'cái',
              quantity: rItem.quantity.toFixed(2),
              unitPrice: rItem.unitPrice.toFixed(2),
              lineTotal: rItem.lineTotal.toFixed(2),
            });
            await manager.save(GoodsReceiptDetail, rDetail);
          }
        }
      }

      return await manager.findOne(GoodsIssue, {
        where: { id: savedIssue.id },
        relations: ['createdBy', 'details', 'details.product'],
      });
    });
  }
}