import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

/**
 * Phụ trách: TV3
 * Loại sản phẩm (ốp lưng, sạc, cáp, tai nghe ...).
 * Khi tạo entity: khai báo TypeOrmModule.forFeature([TênEntity]) trong imports của module này.
 */
@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
