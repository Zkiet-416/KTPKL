import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'Products', schema: 'dbo' })
export class GoodsEntity {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'int' })
  id!: number;

  @Column({ name: 'Code', type: 'nvarchar', length: 30, unique: true })
  code!: string;

  @Column({ name: 'Name', type: 'nvarchar', length: 200 })
  name!: string;

  @Column({ name: 'CategoryId', type: 'int' })
  categoryId!: number;

  @Column({ name: 'Unit', type: 'nvarchar', length: 30, default: 'cái' })
  unit!: string;

  @Column({ name: 'SalePrice', type: 'decimal', precision: 18, scale: 2 })
  sellingPrice!: number;

  @Column({ name: 'StockQuantity', type: 'int', default: 0 })
  stock!: number;

  @Column({ name: 'IsActive', type: 'bit', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime2' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'UpdatedAt', type: 'datetime2', nullable: true })
  updatedAt!: Date | null;
}