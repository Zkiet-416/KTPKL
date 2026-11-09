import { IsString, IsEnum, IsArray, ValidateNested, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class GoodsIssueDetailDto {
  @IsNotEmpty()
  @IsString()
  goodsId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Số lượng phải lớn hơn hoặc bằng 1' })
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateGoodsIssueDto {
  @IsNotEmpty()
  @IsString()
  issueCode: string;

  @IsNotEmpty()
  @IsEnum(['IMPORT', 'EXPORT'], { message: 'Loại phiếu phải là IMPORT hoặc EXPORT' })
  type: 'IMPORT' | 'EXPORT';

  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsIssueDetailDto)
  details: GoodsIssueDetailDto[];
}
