import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { GoodsReceiptsModule } from './modules/goods-receipts/goods-receipts.module';
import { GoodsIssuesModule } from './modules/goods-issues/goods-issues.module';
import { StatisticsModule } from './modules/statistics/statistics.module';

@Module({
  imports: [
    // Đọc biến môi trường từ file .env ở thư mục gốc (../.env)
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] }),

    // Kết nối SQL Server qua TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mssql' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 1433)),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME', 'QuanLyKhoPhuKien'),
        autoLoadEntities: true, // entity khai báo trong TypeOrmModule.forFeature() của từng module
        synchronize: config.get('DB_SYNCHRONIZE') === 'true',
        retryAttempts: 3,
        retryDelay: 2000,
        options: {
          encrypt: config.get('DB_ENCRYPT') === 'true',
          trustServerCertificate: config.get('DB_TRUST_SERVER_CERTIFICATE') !== 'false',
        },
      }),
    }),

    // ===== Các module nghiệp vụ =====
    HealthModule,
    AuthModule, // TV1
    UsersModule, // TV1
    CategoriesModule, // TV3
    ProductsModule, // TV3
    SuppliersModule, // TV4
    GoodsReceiptsModule, // TV4
    GoodsIssuesModule, // TV5
    StatisticsModule, // TV2
  ],
})
export class AppModule {}
