import { ApiProperty } from '@nestjs/swagger';
import {
  GoodsReceiptCreatorDto,
  GoodsReceiptResponseDto,
  GoodsReceiptSupplierDto,
} from './goods-receipt-response.dto';

export class GoodsReceiptPrintSupplierDto extends GoodsReceiptSupplierDto {
  @ApiProperty({ example: 'Trần Văn Bình', nullable: true })
  contactName!: string | null;

  @ApiProperty({ example: '0909123456' })
  phone!: string;

  @ApiProperty({ example: 'abc@gmail.com', nullable: true })
  email!: string | null;

  @ApiProperty({ example: '123 Nguyễn Trãi, Quận 5', nullable: true })
  address!: string | null;
}

export class GoodsReceiptPrintCreatorDto extends GoodsReceiptCreatorDto {
  @ApiProperty({ example: 'admin01' })
  username!: string;
}

export class GoodsReceiptPrintResponseDto extends GoodsReceiptResponseDto {
  @ApiProperty({ type: GoodsReceiptPrintSupplierDto })
  declare supplier: GoodsReceiptPrintSupplierDto;

  @ApiProperty({ type: GoodsReceiptPrintCreatorDto })
  declare createdBy: GoodsReceiptPrintCreatorDto;
}