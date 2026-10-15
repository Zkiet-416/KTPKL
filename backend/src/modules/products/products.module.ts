import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

/**
 * Phụ trách: TV3
 * Sản phẩm: CRUD, tìm kiếm, lọc theo giá/tên, sắp xếp, xem tồn kho.
 * Khi tạo entity: khai báo TypeOrmModule.forFeature([TênEntity]) trong imports của module này.
 */
@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
