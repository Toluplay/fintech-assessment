import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Never log request bodies: they may contain passwords or other credentials.
    logger: ['error', 'warn', 'log'],
  });

  // API_PORT wins over the generic PORT so the API never collides with the web dev server.
  const port = Number(process.env.API_PORT ?? process.env.PORT ?? 3000);
  const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Security headers (CSP, HSTS, X-Content-Type-Options, ...).
  app.use(helmet());
  app.use(cookieParser());
  // Behind a reverse proxy (Render, Fly, nginx...) so `secure` cookies and
  // rate limiting see the real client IP / protocol.
  app.set('trust proxy', 1);

  // CORS is an allow-list, never `*`, because the API accepts credentials (cookies).
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Simulate-Status'],
    maxAge: 600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true, // ...and reject requests that send them
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableShutdownHooks();
  await app.listen(port);
  Logger.log(`Veridian mock API listening on http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();
