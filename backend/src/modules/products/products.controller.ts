import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  // TODO (TV3): thêm các endpoint (@Get, @Post, @Patch, @Delete ...)
}
