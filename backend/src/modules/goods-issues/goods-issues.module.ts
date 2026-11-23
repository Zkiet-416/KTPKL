import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoodsIssuesController } from './goods-issues.controller';
import { GoodsIssuesService } from './goods-issues.service';
import { GoodsIssue } from './entities/goods-issue.entity';
import { GoodsIssueDetail } from './entities/goods-issue-detail.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoodsIssue, GoodsIssueDetail, Product]),
  ],
  controllers: [GoodsIssuesController],
  providers: [GoodsIssuesService],
  exports: [GoodsIssuesService],
})
export class GoodsIssuesModule {}