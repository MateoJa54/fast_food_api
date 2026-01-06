import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // elimina campos no esperados
      forbidNonWhitelisted: true, // rechaza payloads con campos extra
      transform: true,            // transforma tipos (query string -> number, etc.)
    }),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
