import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GoodsIssue } from './goods-issue.entity';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'GoodsIssueDetails', schema: 'dbo' })
export class GoodsIssueDetail {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'int' })
  id!: number;

  @Column({ name: 'GoodsIssueId', type: 'int' })
  goodsIssueId!: number;

  @ManyToOne(() => GoodsIssue, (issue) => issue.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'GoodsIssueId' })
  goodsIssue!: GoodsIssue;

  @Column({ name: 'ProductId', type: 'int' })
  goodsId!: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'ProductId' })
  product!: Product;

  @Column({ name: 'Quantity', type: 'int' })
  quantity!: number;

  @Column({ name: 'UnitPrice', type: 'decimal', precision: 18, scale: 2 })
  unitPrice!: number;
}