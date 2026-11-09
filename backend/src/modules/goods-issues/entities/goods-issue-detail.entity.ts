import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GoodsIssueEntity } from './goods-issue.entity';

@Entity('goods_issue_details')
export class GoodsIssueDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  goodsIssueId: string;

  @ManyToOne(() => GoodsIssueEntity, (issue) => issue.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goodsIssueId' })
  goodsIssue: GoodsIssueEntity;

  @Column()
  goodsId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;
}
