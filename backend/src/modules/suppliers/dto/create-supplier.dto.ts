import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateSupplierDto {
  @IsNotEmpty({ message: 'Tên nhà cung cấp không được để trống' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @Matches(/^(0|\+84)[0-9]{9,10}$/, {
    message: 'Số điện thoại không đúng định dạng Việt Nam',
  })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;
}