import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

/**
 * Phụ trách: TV2
 * Thống kê lịch sử nhập kho theo tháng / năm.
 * Khi tạo entity: khai báo TypeOrmModule.forFeature([TênEntity]) trong imports của module này.
 */
@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
