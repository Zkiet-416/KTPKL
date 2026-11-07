import { ApiProperty } from '@nestjs/swagger';

export class StockAlertDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'OL-IP15-01' })
  code!: string;

  @ApiProperty({ example: 'Ốp lưng iPhone 15' })
  name!: string;

  @ApiProperty({ example: 5, description: 'Số lượng tồn kho dưới ngưỡng 10' })
  stockQuantity!: number;
}
