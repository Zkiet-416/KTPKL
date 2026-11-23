import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
    });
  }

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Chỉ check trùng tên với các category đang hoạt động
    const existingCategory = await this.categoryRepository.findOneBy({ 
      name: createCategoryDto.name,
      isActive: true, 
    });
    if (existingCategory) {
      throw new ConflictException(`Danh mục với tên "${createCategoryDto.name}" đã tồn tại.`);
    }
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: number, updateCategoryDto: Partial<CreateCategoryDto>): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ 
      id: id,
      isActive: true, 
    });
    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với id: ${id}`);
    }

    // Nếu có update tên mới, check xem có bị trùng với danh mục khác không
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const duplicateName = await this.categoryRepository.findOneBy({
        name: updateCategoryDto.name,
        isActive: true,
      });
      if (duplicateName) {
        throw new ConflictException(`Danh mục với tên "${updateCategoryDto.name}" đã tồn tại.`);
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoryRepository.findOneBy({
      id: id,
      isActive: true,
    });
    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với id: ${id}`);
    }

    const products = await this.categoryRepository.query(
      'SELECT TOP (1) 1 FROM dbo.Products WHERE CategoryId = @0 AND IsActive = 1',
      [id],
    );
    if (products.length > 0) {
      throw new BadRequestException('Không thể xóa danh mục đang có sản phẩm hoạt động.');
    }

    category.isActive = false;
    await this.categoryRepository.save(category);
  }
}