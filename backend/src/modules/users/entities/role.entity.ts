import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'Roles', schema: 'dbo' })
export class RoleEntity {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'int' })
  id!: number;

  @Column({ name: 'Code', type: 'nvarchar', length: 30, unique: true })
  code!: string;

  @Column({ name: 'Name', type: 'nvarchar', length: 100 })
  name!: string;

  @Column({ name: 'Description', type: 'nvarchar', length: 255, nullable: true })
  description!: string | null;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];
}