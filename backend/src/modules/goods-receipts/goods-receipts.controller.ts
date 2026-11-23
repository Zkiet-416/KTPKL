


import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { GoodsReceiptsService } from './goods-receipts.service';
import { GoodsReceiptsQueryDto } from './dto/goods-receipts-query.dto';

import { GoodsReceiptHistoryQueryDto } from './dto/goods-receipt-history-query.dto';


@ApiTags('goods-receipts')
@Controller('goods-receipts')
export class GoodsReceiptsController {
  constructor(private readonly service: GoodsReceiptsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phiếu nhập kho' })
  findAll(@Query() queryDto: GoodsReceiptsQueryDto) {
    return this.service.findAll(queryDto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Thống kê phiếu nhập theo tháng/năm' })
  getStatistics(@Query() query: GoodsReceiptHistoryQueryDto) {
    return this.service.findHistory(query);
  }

  @Get(':id/print')
  @ApiOperation({ summary: 'Lấy dữ liệu phiếu nhập phục vụ in ấn' })
  getPrintData(@Param('id', ParseIntPipe) id: number) {
    return this.service.getPrintData(id);
}
  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết phiếu nhập và danh sách sản phẩm' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  
}