import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GoodsIssueEntity } from './goods-issue.entity';
import { GoodsEntity } from '../goods.entity';

@Entity({ name: 'GoodsIssueDetails', schema: 'dbo' })
export class GoodsIssueDetail {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'int' })
  id!: number;

  @Column({ name: 'GoodsIssueId', type: 'int' })
  goodsIssueId!: number;

  @ManyToOne(() => GoodsIssueEntity, (issue) => issue.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'GoodsIssueId' })
  goodsIssue!: GoodsIssueEntity;

  @Column({ name: 'ProductId', type: 'int' })
  goodsId!: number;

  @ManyToOne(() => GoodsEntity)
  @JoinColumn({ name: 'ProductId' })
  product!: GoodsEntity;

  @Column({ name: 'Quantity', type: 'int' })
  quantity!: number;

  @Column({ name: 'UnitPrice', type: 'decimal', precision: 18, scale: 2 })
  unitPrice!: number;
}