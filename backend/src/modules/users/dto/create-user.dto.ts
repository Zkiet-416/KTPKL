import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'manager2' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'Password@123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Lê Văn Quản Lý' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiPropertyOptional({ example: 'manager2@warehouse.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '0908888999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 2, description: 'ID phân quyền Role' })
  @IsInt()
  roleId!: number;
}