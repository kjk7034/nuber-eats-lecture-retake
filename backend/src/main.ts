import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const corsOptions: CorsOptions = {
    origin: 'http://localhost:3000', // Next.js 앱의 도메인
    credentials: true, // 쿠키 허용
  };
  app.enableCors(corsOptions);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(4000);

  const serverUrl = await app.getUrl();
  configService.set('SERVER_URL', serverUrl);
}
bootstrap();
