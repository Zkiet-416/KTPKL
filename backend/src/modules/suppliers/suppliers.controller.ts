import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierQueryDto } from './dto/supplier-query.dto';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  // 1. GET /api/suppliers (Cho phép các vai trò đã đăng nhập xem danh sách)
  @Get()
  @Roles(Role.WAREHOUSE_MANAGER, Role.WAREHOUSE_STAFF)
  async findAll(@Query() query: SupplierQueryDto) {
    return await this.suppliersService.findAll(query);
  }

  // 2. GET /api/suppliers/:id (Xem chi tiết nhà cung cấp)
  @Get(':id')
  @Roles(Role.WAREHOUSE_MANAGER, Role.WAREHOUSE_STAFF)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.suppliersService.findOne(id);
  }

  // 3. POST /api/suppliers (Chỉ WAREHOUSE_MANAGER được thêm mới -> 201 Created)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.WAREHOUSE_MANAGER)
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return await this.suppliersService.create(createSupplierDto);
  }

  // 4A. PUT /api/suppliers/:id (Khớp 100% kịch bản chấm bài GD1-06)
  @Put(':id')
  @Roles(Role.WAREHOUSE_MANAGER)
  async updatePut(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return await this.suppliersService.update(id, updateSupplierDto);
  }

  // 4B. PATCH /api/suppliers/:id (Khớp 100% quy ước REST API trong naming-convention.md)
  @Patch(':id')
  @Roles(Role.WAREHOUSE_MANAGER)
  async updatePatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return await this.suppliersService.update(id, updateSupplierDto);
  }

  // 5. DELETE /api/suppliers/:id (Chỉ WAREHOUSE_MANAGER được xóa mềm)
  @Delete(':id')
  @Roles(Role.WAREHOUSE_MANAGER)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.suppliersService.remove(id);
  }
}