
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { GoodsReceipt } from './goods-receipt.entity';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'GoodsReceiptDetails', schema: 'dbo' })
export class GoodsReceiptDetail {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'int' })
  id!: number;

  @Column({ name: 'GoodsReceiptId', type: 'int' })
  goodsReceiptId!: number;

  @Column({ name: 'ProductId', type: 'int' })
  productId!: number;

  @Column({ name: 'Unit', type: 'nvarchar', length: 30 })
  unit!: string;

  @Column({
    name: 'UnitPrice',
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  unitPrice!: string;

  @Column({
    name: 'Quantity',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  quantity!: string;

  @Column({
    name: 'LineTotal',
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  lineTotal!: string;

  @ManyToOne(() => Product, (product) => product.goodsReceiptDetails)
  @JoinColumn({ name: 'ProductId' })
  product!: Product;

  @ManyToOne(() => GoodsReceipt, (receipt) => receipt.details,{onDelete:'CASCADE'})
  @JoinColumn({ name: 'GoodsReceiptId' })
  goodsReceipt!: GoodsReceipt;
}
