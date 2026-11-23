import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class GoodsIssueQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(['NHAP', 'XUAT'])
  issueType?: 'NHAP' | 'XUAT';
}