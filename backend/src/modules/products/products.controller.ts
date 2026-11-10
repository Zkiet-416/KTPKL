import { 
  Controller, 
  Get, 
  Param, 
  Post, 
  Body, 
  Put, 
  Delete, 
  Query, 
  ParseIntPipe, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  getProducts(@Query() query: ProductQueryDto) { // Đã sửa @Param thành @Query
    return this.service.getProducts(query);
  }

  @Get(':id')
  getProductById(@Param('id', ParseIntPipe) id: number) { // Đã thêm ParseIntPipe
    return this.service.getProductById(id);
  }

  @Post()
  createProduct(@Body() dto: CreateProductDto) {
    return this.service.createProduct(dto);
  }

  @Put(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number, 
    @Body() dto: CreateProductDto
  ) {
    return this.service.updateProduct(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProduct(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.deleteProduct(id);
  }
}