import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Tất cả API có tiền tố /api  (vd: http://localhost:3000/api/health)
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (config.get<string>('CORS_ORIGIN') ?? 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
  });

  // Tự động validate + loại bỏ field thừa trong body (dùng class-validator trong DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger: tài liệu API tại http://localhost:3000/api/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Quản lý kho phụ kiện điện thoại')
    .setDescription('Tài liệu API cho đồ án Phân tích thiết kế HTTT')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = Number(config.get('PORT') ?? 3000);
  await app.listen(port);
  console.log(`🚀 Backend:  http://localhost:${port}/api`);
  console.log(`📘 Swagger:  http://localhost:${port}/api/docs`);
}

void bootstrap();
