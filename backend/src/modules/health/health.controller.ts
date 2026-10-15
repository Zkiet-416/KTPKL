import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Module MẪU: các thành viên xem cách viết controller/service/module rồi làm tương tự.
 * GET /api/health  -> kiểm tra BE và kết nối SQL Server.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Kiểm tra trạng thái Backend và Database' })
  async check() {
    let dbStatus: 'up' | 'down' = 'down';
    let dbName: string | null = null;
    let dbError: string | null = null;

    try {
      const rows = await this.dataSource.query('SELECT DB_NAME() AS name');
      dbStatus = 'up';
      dbName = rows?.[0]?.name ?? null;
    } catch (err) {
      dbError = err instanceof Error ? err.message : String(err);
    }

    return {
      status: 'ok',
      service: 'qlkho-backend',
      time: new Date().toISOString(),
      database: { status: dbStatus, name: dbName, error: dbError },
    };
  }
}
