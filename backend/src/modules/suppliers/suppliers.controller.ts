import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  // TODO (TV4): thêm các endpoint (@Get, @Post, @Patch, @Delete ...)
}
