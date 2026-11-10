import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { StatisticsOverviewDto } from './dto/statistics-overview.dto.js';
import { StockAlertDto } from './dto/stock-alert.dto';

@Injectable()
export class StatisticsService {
  constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>) {}

  async calculateTotalStock() {
    const totalStock = await this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true })
      .select('SUM(product.stockQuantity)', 'totalStock')
      .getRawOne();
    if (!totalStock || totalStock.totalStock === null) {
      return 0;
    } else {
      return parseInt(totalStock.totalStock, 10);
    }
  }

  async calculateTotalProducts() {
    const totalProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true })
      .select('COUNT(product.id)', 'totalProducts')
      .getRawOne();
    if (!totalProducts || totalProducts.totalProducts === null) {
      return 0;
    } else {
      return parseInt(totalProducts.totalProducts, 10);
    }
  }

  async allertLowStockProducts(): Promise<StockAlertDto[]> {
    return this.productRepository.find({
      where: {
        isActive: true,
        stockQuantity: LessThan(10),
      },
      select: ['id', 'code', 'name', 'stockQuantity'],
      order: {
        stockQuantity: 'ASC',},
    });
  }

  async getStatisticsOverview(): Promise<StatisticsOverviewDto> {
    const totalStock = await this.calculateTotalStock();
    const totalProducts = await this.calculateTotalProducts();
    const lowStockProducts = await this.allertLowStockProducts();
    return {
      totalStockQuantity: totalStock,
      totalProducts: totalProducts,
      lowStockProducts: lowStockProducts,
    };
  }
}
