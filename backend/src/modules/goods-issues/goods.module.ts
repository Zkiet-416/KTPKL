import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoodsController } from './goods.controller';
import { GoodsService } from './goods.service';
import { GoodsEntity } from './entities/goods.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GoodsEntity])],
  controllers: [GoodsController],
  providers: [GoodsService],
  exports: [GoodsService],
})
export class GoodsModule {}
