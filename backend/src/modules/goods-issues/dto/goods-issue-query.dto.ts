import { IsOptional, IsString, IsEnum } from 'class-validator';

export class GoodsIssueQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['IMPORT', 'EXPORT'])
  type?: 'IMPORT' | 'EXPORT';
}
