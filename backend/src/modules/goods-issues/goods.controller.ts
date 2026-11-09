import { Controller, Get, Param, Query } from '@nestjs/common';
import { GoodsService } from './goods.service';
import { GoodsQueryDto } from './dto/goods-query.dto';

@Controller('goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @Get()
  findAll(@Query() queryDto: GoodsQueryDto) {
    return this.goodsService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.goodsService.findOne(id);
  }
}
