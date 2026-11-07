import { ApiProperty } from '@nestjs/swagger';
import { StockAlertDto } from './stock-alert.dto.js';

export class StatisticsOverviewDto {
  @ApiProperty({ example: 1250, description: 'Tổng số lượng tồn kho' })
  totalStockQuantity!: number;

  @ApiProperty({ example: 86, description: 'Tổng số sản phẩm' })
  totalProducts!: number;

  @ApiProperty({ type: [StockAlertDto] })
  lowStockProducts!: StockAlertDto[];
}
