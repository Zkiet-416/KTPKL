import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  // TODO (TV3): thêm các endpoint (@Get, @Post, @Patch, @Delete ...)
}
