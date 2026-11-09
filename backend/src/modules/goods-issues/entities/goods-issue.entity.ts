import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { GoodsIssueDetail } from './goods-issue-detail.entity';

@Entity('goods_issues')
export class GoodsIssueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  issueCode: string;

  @Column({ type: 'enum', enum: ['IMPORT', 'EXPORT'] })
  type: 'IMPORT' | 'EXPORT';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  issueDate: Date;

  @Column({ nullable: true })
  note: string;

  @OneToMany(() => GoodsIssueDetail, (detail) => detail.goodsIssue, { cascade: true })
  details: GoodsIssueDetail[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
