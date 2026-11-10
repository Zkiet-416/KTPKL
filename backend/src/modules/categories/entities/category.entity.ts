import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'Categories', schema: 'dbo' })
export class Category {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'int' })
  id!: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 100 })
  name!: string;

  @Column({
    name: 'Description',
    type: 'nvarchar',
    length: 255,
    nullable: true,
  })
  description!: string | null;

  @Column({ name: 'IsActive', type: 'bit', default: () => '1' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime2' })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'UpdatedAt',
    type: 'datetime2',
    nullable: true,
  })
  updatedAt!: Date | null;
}