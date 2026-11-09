import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoodsEntity } from './entities/goods.entity';
import { GoodsQueryDto } from './dto/goods-query.dto';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(GoodsEntity)
    private readonly goodsRepo: Repository<GoodsEntity>,
  ) {}

  async findAll(queryDto: GoodsQueryDto) {
    const { search, minPrice, maxPrice, page = 1, limit = 10 } = queryDto;
    const query = this.goodsRepo.createQueryBuilder('goods');

    if (search) {
      query.andWhere('(goods.name ILIKE :search OR goods.code ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (minPrice !== undefined) {
      query.andWhere('goods.sellingPrice >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('goods.sellingPrice <= :maxPrice', { maxPrice });
    }

    query.skip((page - 1) * limit).take(limit);
    const [items, total] = await query.getManyAndCount();

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const goods = await this.goodsRepo.findOne({ where: { id } });
    if (!goods) {
      throw new NotFoundException(`Không tìm thấy hàng hóa với ID: ${id}`);
    }
    return goods;
  }
}
