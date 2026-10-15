import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/**
 * Phụ trách: TV1
 * Admin quản lý người dùng: thêm / sửa / xóa / khóa / phân quyền.
 * Khi tạo entity: khai báo TypeOrmModule.forFeature([TênEntity]) trong imports của module này.
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
