import { ApiProperty } from '@nestjs/swagger';

export class GoodsReceiptSupplierDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Công ty TNHH Phụ kiện ABC' })
  name!: string;
}

export class GoodsReceiptCreatorDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Nguyễn Văn An' })
  fullName!: string;
}

export class GoodsReceiptProductDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'SP001' })
  code!: string;

  @ApiProperty({ example: 'Ốp lưng iPhone 15' })
  name!: string;

  @ApiProperty({ example: 'cái' })
  unit!: string;

  @ApiProperty({ example: '10.00', description: 'Số lượng nhập' })
  quantity!: string;

  @ApiProperty({ example: '50000.00', description: 'Đơn giá nhập' })
  unitPrice!: string;

  @ApiProperty({ example: '500000.00', description: 'Thành tiền của sản phẩm' })
  lineTotal!: string;
}

export class GoodsReceiptResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'PN001' })
  receiptCode!: string;

  @ApiProperty({ example: '2026-11-07T10:30:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '500000.00' })
  totalAmount!: string;

  @ApiProperty({ example: 'Nhập hàng đợt tháng 11', nullable: true })
  note!: string | null;

  @ApiProperty({ type: GoodsReceiptSupplierDto })
  supplier!: GoodsReceiptSupplierDto;

  @ApiProperty({ type: GoodsReceiptCreatorDto })
  createdBy!: GoodsReceiptCreatorDto;

  @ApiProperty({ type: [GoodsReceiptProductDto] })
  details!: GoodsReceiptProductDto[];
}