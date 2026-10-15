import { Module } from '@nestjs/common';
import { GoodsIssuesController } from './goods-issues.controller';
import { GoodsIssuesService } from './goods-issues.service';

/**
 * Phụ trách: TV5
 * Phiếu xuất kho: lập phiếu (giảm tồn, không xuất quá tồn).
 * Khi tạo entity: khai báo TypeOrmModule.forFeature([TênEntity]) trong imports của module này.
 */
@Module({
  controllers: [GoodsIssuesController],
  providers: [GoodsIssuesService],
  exports: [GoodsIssuesService],
})
export class GoodsIssuesModule {}
