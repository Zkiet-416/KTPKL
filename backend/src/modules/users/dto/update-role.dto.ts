import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ example: 2, description: 'Role ID mới cần gán' })
  @IsInt()
  roleId!: number;
}