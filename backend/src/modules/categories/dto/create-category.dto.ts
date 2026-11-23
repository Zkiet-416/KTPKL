import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Ốp lưng' }) //Khai báo ví dụ cho trường name trong Swagger UI
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  ) //xóa khoảng trắng đầu và cuối chuỗi
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Các loại ốp lưng điện thoại' })
  @IsOptional() //Cho phép trường description có thể không được cung cấp
  @IsString()
  @MaxLength(255)
  description?: string | null;
}