import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoodsReceiptsQueryDto } from './dto/goods-receipts-query.dto';
import { GoodsReceipt } from './entities/goods-receipt.entity';
import { GoodsReceiptDetail } from './entities/goods-receipt-detail.entity';
import { GoodsReceiptResponseDto } from './dto/goods-receipt-response.dto';
import { NotFoundException } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { GoodsReceiptHistoryQueryDto } from './dto/goods-receipt-history-query.dto';
import { GoodsReceiptHistoryResponseDto } from './dto/goods-receipt-history-response.dto';
import { GoodsReceiptPrintResponseDto } from './dto/goods-receipt-print-response.dto';

@Injectable()
export class GoodsReceiptsService {
  constructor(
    @InjectRepository(GoodsReceipt)
    private readonly goodsReceiptRepository: Repository<GoodsReceipt>,

    @InjectRepository(GoodsReceiptDetail)
    private readonly goodsReceiptDetailRepository: Repository<GoodsReceiptDetail>,
  ) {}

  async findAll(queryDto: GoodsReceiptsQueryDto) {
  const {
    page = 1,
    limit = 10,
    search,
    month,
    year,
    sortBy = 'createdAt',
    order = 'ASC',
  } = queryDto;

  // Bước 1: Khởi tạo truy vấn phiếu nhập
  const query = this.goodsReceiptRepository
    .createQueryBuilder('receipt')
    .leftJoinAndSelect('receipt.supplier', 'supplier')
    .leftJoinAndSelect('receipt.createdBy', 'creator');

  // Bước 2: Tìm kiếm theo mã phiếu hoặc tên nhà cung cấp
  if (search?.trim()) {
    query.andWhere(
      '(receipt.receiptCode LIKE :search OR supplier.name LIKE :search)',
      { search: `%${search.trim()}%` },
    );
  }

  // Bước 3: Lọc theo tháng và năm
  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    query.andWhere('receipt.createdAt >= :startDate', { startDate });
    query.andWhere('receipt.createdAt < :endDate', { endDate });
  } else if (month) {
    query.andWhere('MONTH(receipt.createdAt) = :month', { month });
  } else if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    query.andWhere('receipt.createdAt >= :startDate', { startDate });
    query.andWhere('receipt.createdAt < :endDate', { endDate });
  }

  // Bước 4: Giới hạn các trường được phép sắp xếp
  const allowedSortFields = [
    'createdAt',
    'receiptCode',
    'totalAmount',
  ];

  const safeSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : 'createdAt';

  const safeOrder = order === 'DESC' ? 'DESC' : 'ASC';

  query.orderBy(`receipt.${safeSortBy}`, safeOrder);

  // Bước 5: Phân trang
  query.skip((page - 1) * limit).take(limit);

  // Bước 6: Thực thi truy vấn
  const [data, total] = await query.getManyAndCount();

  // Bước 7: Trả kết quả
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async findOne(id: number): Promise<GoodsReceiptResponseDto> {
  // Bước 1: Tìm phiếu nhập và lấy các dữ liệu liên quan
  const receipt = await this.goodsReceiptRepository
    .createQueryBuilder('receipt')
    .leftJoinAndSelect('receipt.supplier', 'supplier')
    .leftJoinAndSelect('receipt.createdBy', 'creator')
    .leftJoinAndSelect('receipt.details', 'detail')
    .leftJoinAndSelect('detail.product', 'product')
    .where('receipt.id = :id', { id })
    .getOne();

  // Bước 2: Kiểm tra phiếu nhập có tồn tại không
  if (!receipt) {
    throw new NotFoundException(
      `Không tìm thấy phiếu nhập có ID ${id}`,
    );
  }

  // Bước 3: Chuyển dữ liệu Entity sang Response DTO
  return {
    id: receipt.id,
    receiptCode: receipt.receiptCode,
    createdAt: receipt.createdAt,
    totalAmount: receipt.totalAmount,
    note: receipt.note,

    supplier: {
      id: receipt.supplier.id,
      name: receipt.supplier.name,
    },

    createdBy: {
      id: receipt.createdBy.id,
      fullName: receipt.createdBy.fullName,
    },

    details: receipt.details.map((detail) => ({
      id: detail.product.id,
      code: detail.product.code,
      name: detail.product.name,
      unit: detail.unit,
      quantity: detail.quantity,
      unitPrice: detail.unitPrice,
      lineTotal: detail.lineTotal,
    })),
  };
}

private applyHistoryFilter(
  query: SelectQueryBuilder<GoodsReceipt>,
  queryDto: GoodsReceiptHistoryQueryDto,
) {
  const { month, year } = queryDto;

  if (month && year) {
    // Lọc phiếu trong đúng tháng và năm
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    query
      .andWhere('receipt.createdAt >= :startDate', { startDate })
      .andWhere('receipt.createdAt < :endDate', { endDate });
  } else if (month) {
    // Chỉ lọc theo tháng, không giới hạn năm
    query.andWhere('MONTH(receipt.createdAt) = :month', { month });
  } else if (year) {
    // Lọc toàn bộ phiếu trong năm
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    query
      .andWhere('receipt.createdAt >= :startDate', { startDate })
      .andWhere('receipt.createdAt < :endDate', { endDate });
  }

  return query;
}

async findHistory(
  queryDto: GoodsReceiptHistoryQueryDto,
): Promise<GoodsReceiptHistoryResponseDto> {
  // Query danh sách phiếu nhập và các quan hệ cần hiển thị
  const receiptsQuery = this.goodsReceiptRepository
    .createQueryBuilder('receipt')
    .leftJoinAndSelect('receipt.supplier', 'supplier')
    .leftJoinAndSelect('receipt.createdBy', 'creator')
    .leftJoinAndSelect('receipt.details', 'detail')
    .leftJoinAndSelect('detail.product', 'product');

  this.applyHistoryFilter(receiptsQuery, queryDto);

  const receipts = await receiptsQuery
    .orderBy('receipt.createdAt', 'DESC')
    .getMany();

  // Query thống kê tổng số phiếu và tổng tiền
  const summaryQuery = this.goodsReceiptRepository
    .createQueryBuilder('receipt')
    .select('COUNT(receipt.id)', 'totalReceipts')
    .addSelect(
      'COALESCE(SUM(receipt.totalAmount), 0)',
      'totalAmount',
    );

  this.applyHistoryFilter(summaryQuery, queryDto);

  const summary = await summaryQuery.getRawOne();

  return {
    month: queryDto.month ?? null,
    year: queryDto.year ?? null,
    totalReceipts: Number(summary.totalReceipts),
    totalAmount: String(summary.totalAmount),
    receipts: receipts.map((receipt) => ({
      id: receipt.id,
      receiptCode: receipt.receiptCode,
      createdAt: receipt.createdAt,
      totalAmount: receipt.totalAmount,
      note: receipt.note,
      supplier: {
        id: receipt.supplier.id,
        name: receipt.supplier.name,
      },
      createdBy: {
        id: receipt.createdBy.id,
        fullName: receipt.createdBy.fullName,
      },
      details: receipt.details.map((detail) => ({
        id: detail.product.id,
        code: detail.product.code,
        name: detail.product.name,
        unit: detail.unit,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        lineTotal: detail.lineTotal,
      })),
    })),
  };
}

async getPrintData(id: number): Promise<GoodsReceiptPrintResponseDto> {
  // Bước 1: Tìm phiếu nhập và lấy toàn bộ dữ liệu cần thiết để in
  const receipt = await this.goodsReceiptRepository
    .createQueryBuilder('receipt')
    .leftJoinAndSelect('receipt.supplier', 'supplier')
    .leftJoinAndSelect('receipt.createdBy', 'creator')
    .leftJoinAndSelect('receipt.details', 'detail')
    .leftJoinAndSelect('detail.product', 'product')
    .where('receipt.id = :id', { id })
    .getOne();

  // Bước 2: Kiểm tra phiếu nhập có tồn tại không
  if (!receipt) {
    throw new NotFoundException(
      `Không tìm thấy phiếu nhập có ID ${id}`,
    );
  }

  // Bước 3: Chuyển Entity sang Print Response DTO
  return {
    id: receipt.id,
    receiptCode: receipt.receiptCode,
    createdAt: receipt.createdAt,
    totalAmount: receipt.totalAmount,
    note: receipt.note,

    supplier: {
      id: receipt.supplier.id,
      name: receipt.supplier.name,
      contactName: receipt.supplier.contactName,
      phone: receipt.supplier.phone,
      email: receipt.supplier.email,
      address: receipt.supplier.address,
    },

    createdBy: {
      id: receipt.createdBy.id,
      fullName: receipt.createdBy.fullName,
      username: receipt.createdBy.username,
    },

    details: receipt.details.map((detail) => ({
      id: detail.product.id,
      code: detail.product.code,
      name: detail.product.name,
      unit: detail.unit,
      quantity: detail.quantity,
      unitPrice: detail.unitPrice,
      lineTotal: detail.lineTotal,
    })),
  };
}

}