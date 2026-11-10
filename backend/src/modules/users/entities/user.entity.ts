import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { RoleEntity } from './role.entity'; // Nếu bạn tách bảng Role riêng
import { GoodsReceipt } from '../../goods-receipts/entities/goods-receipt.entity';
import { GoodsIssueEntity } from '../../goods-issues/entities/goods-issue.entity';

@Entity({ name: 'Users', schema: 'dbo' })
export class User {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'int' })
  id!: number;

  @Column({ name: 'Username', type: 'nvarchar', length: 50, unique: true })
  username!: string;

  @Column({ name: 'PasswordHash', type: 'nvarchar', length: 255 })
  passwordHash!: string;

  @Column({ name: 'FullName', type: 'nvarchar', length: 100 })
  fullName!: string;

  @Column({ name: 'Email', type: 'nvarchar', length: 100, nullable: true })
  email!: string | null;

  @Column({ name: 'Phone', type: 'nvarchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ name: 'RoleId', type: 'int' })
  roleId!: number;

  @ManyToOne(() => RoleEntity, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'RoleId', referencedColumnName: 'id' })
  role!: RoleEntity;

  @Column({ name: 'IsActive', type: 'bit', default: () => '1' })
  isActive!: boolean;

  @Column({ name: 'LastLoginAt', type: 'datetime2', nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime2' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'UpdatedAt', type: 'datetime2', nullable: true })
  updatedAt!: Date | null;

  @OneToMany(() => GoodsReceipt, (receipt) => receipt.createdBy)
  goodsReceipts!: GoodsReceipt[];

  @OneToMany(() => GoodsIssueEntity, (issue) => issue.createdBy)
  goodsIssues!: GoodsIssueEntity[];
}