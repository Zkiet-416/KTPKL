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
  const page = query.page ?? 1; //mặc định page = 1 nếu query.page là undefined
  const limit = query.limit ?? 10; //mặc định limit = 10 nếu query.limit là undefined

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

  async getProductById(id: number): Promise<Product | null> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với id: ${id}`);
    }
    return product;
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    const existingProduct = await this.productRepository.findOneBy({ id: product.id });
    if (existingProduct) {
      throw new ConflictException(`Sản phẩm với mã "${product.id}" đã tồn tại.`);
    }
    if (product.stockQuantity === undefined || product.stockQuantity < 0) {
      throw new BadRequestException(`Số lượng tồn kho không hợp lệ: ${product.stockQuantity}`);
    }
    if (product.salePrice <= 0 || product.salePrice === undefined) {
      throw new BadRequestException(`Giá bán phải lớn hơn 0: ${product.salePrice}`);
    }
    return this.productRepository.save(product);
  }

  async updateProduct(id: number, updateProductDto: Partial<CreateProductDto>): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với id: ${id}`);
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
