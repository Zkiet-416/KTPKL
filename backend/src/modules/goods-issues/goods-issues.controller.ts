import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoodsIssuesService } from './goods-issues.service';

@ApiTags('goods-issues')
@Controller('goods-issues')
export class GoodsIssuesController {
  constructor(private readonly service: GoodsIssuesService) {}

  // TODO (TV5): thêm các endpoint (@Get, @Post, @Patch, @Delete ...)
}
