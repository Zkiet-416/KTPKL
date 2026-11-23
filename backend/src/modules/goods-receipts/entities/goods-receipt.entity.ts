import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import {Supplier} from '../../suppliers/entities/supplier.entity';
import { User } from '../../users/entities/user.entity';
import { GoodsReceiptDetail } from './goods-receipt-detail.entity';

@Entity({ name: 'GoodsReceipts', schema: 'dbo' })
export class GoodsReceipt {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'int' })
  id!: number;

  @Column({ name: 'ReceiptCode', type: 'varchar', length: 20 })
  receiptCode!: string;

  @Column({ name: 'SupplierId', type: 'int' })
  supplierId!: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.goodsReceipts)
  @JoinColumn({ name: 'SupplierId', referencedColumnName: 'id' })
  supplier!: Supplier;

  @Column({ name: 'CreatedByUserId', type: 'int' })
  createdByUserId!: number;

  @ManyToOne(() => User, (user) => user.goodsReceipts)
  @JoinColumn({ name: 'CreatedByUserId', referencedColumnName: 'id' })
  createdBy!: User;

  @Column({ name: 'CreatedAt', type: 'datetime2', default: ()=> 'GETDATE()' })
  createdAt!: Date;


  @Column({
    name: 'TotalAmount',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  totalAmount!: string;

  @Column({
    name: 'Note',
    type: 'nvarchar',
    length: 500,
    nullable: true,
  })
  note!: string | null;

  @OneToMany(() => GoodsReceiptDetail, (detail) => detail.goodsReceipt)
  details!: GoodsReceiptDetail[];
}