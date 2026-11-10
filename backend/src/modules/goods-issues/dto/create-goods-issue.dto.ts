// create-goods-issue.dto.ts
import { IsString, IsEnum, IsArray, ValidateNested, IsNotEmpty, IsNumber, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class GoodsIssueDetailDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  goodsId!: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Số lượng phải lớn hơn hoặc bằng 1' })
  quantity!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateGoodsIssueDto {
  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsNotEmpty()
  @IsEnum(['NHAP', 'XUAT'], { message: 'Loại phiếu phải là NHAP hoặc XUAT' })
  type!: 'NHAP' | 'XUAT';

  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsIssueDetailDto)
  details!: GoodsIssueDetailDto[];
}