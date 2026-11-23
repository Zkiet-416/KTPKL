import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { GoodsReceipt } from '../../goods-receipts/entities/goods-receipt.entity';

@Entity({ name: 'Suppliers', schema: 'dbo' })
export class Supplier {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'int' })
  id!: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 150 })
  name!: string;

  @Column({ name: 'ContactName', type: 'nvarchar', length: 100, nullable: true })
  contactName!: string | null;

  @Column({ name: 'Phone', type: 'nvarchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ name: 'Email', type: 'nvarchar', length: 100, nullable: true })
  email!: string | null;

  @Column({ name: 'Address', type: 'nvarchar', length: 255, nullable: true })
  address!: string | null;

  @Column({ name: 'IsActive', type: 'bit', default: () => '1' })
  isActive!: boolean;

  @OneToMany(() => GoodsReceipt, (receipt) => receipt.supplier)
  goodsReceipts!: GoodsReceipt[];
}