import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('api')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get('categories')
  getAll() {
    return this.service.getAllCategories();
  }

  @Post('categories')
  create(@Body() dto: CreateCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Put('categories/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.service.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.deleteCategory(id);
  }
}
