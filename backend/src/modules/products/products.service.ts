import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { Product } from './entities/product.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductQueryDto } from './dto/product-query.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getProducts(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const builder = this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true });

    if (query.categoryId) {
      builder.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.search?.trim()) {
      builder.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.code) LIKE LOWER(:search))',
        { search: `%${query.search.trim()}%` },
      );
    }

    const [data, total] = await builder
      .orderBy('product.categoryId', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với id: ${id}`);
    }
    return product;
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    // Kiểm tra trùng mã sản phẩm (code) nếu entity có trường code
    if (createProductDto.code) {
      const existingProduct = await this.productRepository.findOneBy({ code: createProductDto.code, isActive: true });
      if (existingProduct) {
        throw new ConflictException(`Sản phẩm với mã "${createProductDto.code}" đã tồn tại.`);
      }
    }

    if (createProductDto.stockQuantity === undefined || createProductDto.stockQuantity < 0) {
      throw new BadRequestException(`Số lượng tồn kho không hợp lệ: ${createProductDto.stockQuantity}`);
    }
    if (createProductDto.salePrice <= 0 || createProductDto.salePrice === undefined) {
      throw new BadRequestException(`Giá bán phải lớn hơn 0: ${createProductDto.salePrice}`);
    }

    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async updateProduct(id: number, updateProductDto: Partial<CreateProductDto>): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với id: ${id}`);
    }

    // Validate khi update nếu có truyền lên stock hoặc price
    if (updateProductDto.stockQuantity !== undefined && updateProductDto.stockQuantity < 0) {
      throw new BadRequestException(`Số lượng tồn kho không hợp lệ: ${updateProductDto.stockQuantity}`);
    }
    if (updateProductDto.salePrice !== undefined && updateProductDto.salePrice <= 0) {
      throw new BadRequestException(`Giá bán phải lớn hơn 0: ${updateProductDto.salePrice}`);
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với id: ${id}`);
    }
    product.isActive = false;
    await this.productRepository.save(product);
  }
}