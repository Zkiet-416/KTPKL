import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { GoodsIssueDetail } from './goods-issue-detail.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'GoodsIssues', schema: 'dbo' })
export class GoodsIssueEntity {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'int' })
  id!: number;

  @Column({ name: 'Code', type: 'nvarchar', length: 30, unique: true })
  issueCode!: string;

  @Column({ name: 'IssueType', type: 'nvarchar', length: 10 })
  type!: 'NHAP' | 'XUAT';

  @Column({ name: 'IssueDate', type: 'datetime2', default: () => 'GETDATE()' })
  issueDate!: Date;

  @Column({ name: 'CreatedByUserId', type: 'int' })
  createdByUserId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'CreatedByUserId' })
  createdBy!: User;

  @Column({ name: 'Note', type: 'nvarchar', length: 500, nullable: true })
  note!: string | null;

  @OneToMany(() => GoodsIssueDetail, (detail) => detail.goodsIssue, { cascade: true })
  details!: GoodsIssueDetail[];

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime2' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'UpdatedAt', type: 'datetime2', nullable: true })
  updatedAt!: Date | null;
}