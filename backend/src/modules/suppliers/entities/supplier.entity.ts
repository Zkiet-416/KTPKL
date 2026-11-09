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

  @Column({ name: 'Name', type: 'nvarchar', length: 200, nullable: false })
  name!: string;

  @Column({
    name: 'Phone',
    type: 'varchar',
    length: 20,
    nullable: true,
    unique: true,
  })
  phone?: string;

  @Column({
    name: 'Email',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  email?: string;

  @Column({ name: 'Address', type: 'nvarchar', length: 500, nullable: true })
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