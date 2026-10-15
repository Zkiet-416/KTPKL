import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoodsReceiptsService } from './goods-receipts.service';

@ApiTags('goods-receipts')
@Controller('goods-receipts')
export class GoodsReceiptsController {
  constructor(private readonly service: GoodsReceiptsService) {}

  // TODO (TV4): thêm các endpoint (@Get, @Post, @Patch, @Delete ...)
}
