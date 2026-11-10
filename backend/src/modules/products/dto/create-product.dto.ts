import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'OL-IP15-01', maxLength: 30 })
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  code!: string;

  @ApiProperty({ example: 'Ốp lưng iPhone 15', maxLength: 200 })
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number;

  @ApiPropertyOptional({ example: 'cái', maxLength: 30, default: 'cái' })
  @IsOptional()
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  unit?: string;

  @ApiProperty({ example: 150000, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  salePrice!: number;

  @ApiPropertyOptional({ example: 0, minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 'Ốp lưng chống sốc', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;
}
