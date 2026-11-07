import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
    const category = this.categoryRepository.create(createCategoryDto);
    const existingCategory = await this.categoryRepository.findOneBy({ name: category.name }); //Tìm kiếm danh mục đã tồn tại với tên category.name
    if (existingCategory) {
      throw new ConflictException(`Danh mục với tên "${category.name}" đã tồn tại.`);
    }
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

    category.isActive = false;
    await this.categoryRepository.save(category);
  }
}
