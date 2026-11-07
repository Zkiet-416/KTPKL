import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  getProducts(@Param('query') query: ProductQueryDto) {
    return this.service.getProducts(query);
  }

  @Get(':id')
  getProductById(@Param('id') id: number) {
    return this.service.getProductById(id);
  }

  @Post()
  createProduct(@Body() dto: CreateProductDto) {
    return this.service.createProduct(dto);
  }

  @Put(':id')
  updateProduct(@Param('id') id: number, @Body() dto: CreateProductDto) {
    return this.service.updateProduct(id, dto);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: number) {
    return this.service.deleteProduct(id);
  }
}
