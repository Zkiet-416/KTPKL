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
      query.andWhere('issue.issueType = :issueType', {
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

    if (!details || details.length === 0) {
      throw new BadRequestException('Chi tiết phiếu xuất/nhập kho không được để trống.');
    }

    // Sử dụng Database Transaction để đảm bảo tính toàn vẹn dữ liệu tồn kho
    return await this.dataSource.transaction(async (manager) => {
      // 1. Kiểm tra mã phiếu trùng
      const existing = await manager.findOne(GoodsIssue, { where: { code } });
      if (existing) {
        throw new BadRequestException(`Mã phiếu "${code}" đã tồn tại.`);
      }

      // 2. Tạo và lưu GoodsIssue chính
      const goodsIssue = manager.create(GoodsIssue, {
        code,
        issueType,
        note,
        createdByUserId: userId,
      });
      const savedIssue = await manager.save(GoodsIssue, goodsIssue);

      // 3. Xử lý chi tiết và cập nhật số lượng tồn kho sản phẩm trong bảng Products
      for (const item of details) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId, isActive: true },
        });

        if (!product) {
          throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${item.productId}`);
        }

        if (issueType === 'XUAT') {
          // Kiểm tra chặn xuất quá số lượng tồn kho -> Trả về 400 Bad Request
          if (product.stockQuantity < item.quantity) {
            throw new BadRequestException(
              `Sản phẩm "${product.name}" (Mã: ${product.code}) không đủ tồn kho. Tồn hiện tại: ${product.stockQuantity}, yêu cầu xuất: ${item.quantity}`,
            );
          }
          // Giảm tồn kho khi xuất
          product.stockQuantity -= item.quantity;
        } else if (issueType === 'NHAP') {
          // Tăng tồn kho khi nhập nội bộ
          product.stockQuantity += item.quantity;
        } else {
          throw new BadRequestException(`Loại phiếu không hợp lệ: ${issueType}. Chỉ chấp nhận 'NHAP' hoặc 'XUAT'.`);
        }

        // Lưu lại tồn kho mới của sản phẩm
        await manager.save(Product, product);

        // Tạo chi tiết phiếu
        const detail = manager.create(GoodsIssueDetail, {
          goodsIssueId: savedIssue.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          note: item.note,
        });
        await manager.save(GoodsIssueDetail, detail);
      }

      // Trả về kết quả phiếu kèm chi tiết
      return await manager.findOne(GoodsIssue, {
        where: { id: savedIssue.id },
        relations: ['createdBy', 'details', 'details.product'],
      });
    });
  }
}