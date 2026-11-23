import { ApiProperty } from '@nestjs/swagger';
import { GoodsReceiptResponseDto } from './goods-receipt-response.dto';

export class GoodsReceiptHistoryResponseDto {
  @ApiProperty({ example: 11, nullable: true })
  month!: number | null;

  @ApiProperty({ example: 2026, nullable: true })
  year!: number | null;

  @ApiProperty({ example: 15 })
  totalReceipts!: number;

  @ApiProperty({ example: '25000000.00' })
  totalAmount!: string;

  @ApiProperty({ type: [GoodsReceiptResponseDto] })
  receipts!: GoodsReceiptResponseDto[];
}