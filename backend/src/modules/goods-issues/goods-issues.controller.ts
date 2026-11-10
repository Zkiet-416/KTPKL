import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GoodsIssuesService } from './goods-issues.service';
import { CreateGoodsIssueDto } from './dto/create-goods-issue.dto';
import { GoodsIssueQueryDto } from './dto/goods-issue-query.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('goods-issues')
@Controller('goods-issues')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GoodsIssuesController {
  constructor(private readonly goodsIssuesService: GoodsIssuesService) {}

  @Get()
  @Roles(Role.WAREHOUSE_MANAGER, Role.WAREHOUSE_STAFF)
  @ApiOperation({ summary: 'Lấy danh sách phiếu xuất/nhập kho' })
  findAll(@Query() queryDto: GoodsIssueQueryDto) {
    return this.goodsIssuesService.findAll(queryDto);
  }

  @Get(':id')
  @Roles(Role.WAREHOUSE_MANAGER, Role.WAREHOUSE_STAFF)
  @ApiOperation({ summary: 'Xem chi tiết phiếu xuất/nhập kho' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.goodsIssuesService.findOne(id);
  }

  @Post()
  @Roles(Role.WAREHOUSE_MANAGER, Role.WAREHOUSE_STAFF)
  @ApiOperation({ summary: 'Lập phiếu xuất/nhập kho (Cập nhật tồn kho trong Transaction)' })
  create(@Body() createDto: CreateGoodsIssueDto, @Req() req: any) {
    // Lấy ID user đang đăng nhập từ JWT token
    const userId = req.user.sub || req.user.id;
    return this.goodsIssuesService.create(createDto, userId);
  }
}