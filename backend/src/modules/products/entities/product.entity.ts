import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { GoodsReceiptDetail } from '../../goods-receipts/entities/goods-receipt-detail.entity';

@Entity({ name: 'Products', schema: 'dbo' })
export class Product {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'int' })
  id!: number;

  @Column({ name: 'Code', type: 'nvarchar', length: 50, unique: true })
  code!: string;

  @Column({ name: 'Name', type: 'nvarchar', length: 200 })
  name!: string;

  @Column({ name: 'CategoryId', type: 'int' })
  categoryId!: number;

  @Column({ name: 'Unit', type: 'nvarchar', length: 50 })
  unit!: string;

  @Column({ name: 'PurchasePrice', type: 'decimal', precision: 18, scale: 2 })
  purchasePrice!: number;

  @Column({ name: 'SellingPrice', type: 'decimal', precision: 18, scale: 2 })
  sellingPrice!: number;

  @Column({ name: 'StockQuantity', type: 'int', default: 0 })
  stockQuantity!: number;

  @Column({ name: 'MinStock', type: 'int', default: 5 })
  minStock!: number;

  @Column({ name: 'IsActive', type: 'bit', default: () => '1' })
  isActive!: boolean;

  @OneToMany(() => GoodsReceiptDetail, (detail) => detail.product)
  goodsReceiptDetails!: GoodsReceiptDetail[];
}