// goods-issue-query.dto.ts
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class GoodsIssueQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['NHAP', 'XUAT'])
  type?: 'NHAP' | 'XUAT';
}