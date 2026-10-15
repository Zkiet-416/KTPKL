import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly service: StatisticsService) {}

  // TODO (TV2): thêm các endpoint (@Get, @Post, @Patch, @Delete ...)
}
