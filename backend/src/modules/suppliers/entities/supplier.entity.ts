import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Suppliers')
export class Supplier {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'int' })
  id!: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 150, nullable: false }) // Khớp length 150 trong schema.sql
  name!: string;

  @Column({
    name: 'Phone',
    type: 'varchar',
    length: 20,
    nullable: true, // Bỏ unique: true để tránh lỗi index null trên SQL Server
  })
  phone?: string;

  @Column({
    name: 'Email',
    type: 'varchar',
    length: 100,
    nullable: true, // Bỏ unique: true
  })
  email?: string;

  @Column({ name: 'Address', type: 'nvarchar', length: 255, nullable: true }) // Khớp length 255 trong schema.sql
  address?: string;

  @Column({ name: 'IsActive', type: 'bit', default: true })
  isActive!: boolean;

  @CreateDateColumn({
    name: 'CreatedAt',
    type: 'datetime2',
    default: () => 'SYSDATETIME()',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'UpdatedAt',
    type: 'datetime2',
    nullable: true,
    onUpdate: 'SYSDATETIME()',
  })
  updatedAt?: Date;
}