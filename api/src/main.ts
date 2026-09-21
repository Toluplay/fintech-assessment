import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

const DEV_SECRET_PATTERN = /change-me/;

/** Refuse to boot in production with missing or placeholder JWT secrets. */
function assertProductionSecrets(): void {
  if (process.env.NODE_ENV !== 'production') return;
  const missing = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'].filter(
    (key) => !process.env[key] || DEV_SECRET_PATTERN.test(process.env[key] ?? ''),
  );
  if (missing.length > 0) {
    Logger.error(
      `Refusing to start in production: set ${missing.join(' and ')} to long random values.`,
      'Bootstrap',
    );
    process.exit(1);
  }
}

async function bootstrap() {
  assertProductionSecrets();
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

  // Single-service deployment: serve the built SPA from this process under
  // the same origin, with the API mounted at /api. Cookies stay first-party.
  const webDist = resolve(process.env.WEB_DIST ?? join(__dirname, '../../web/dist'));
  const serveWeb = process.env.SERVE_WEB === 'true' && existsSync(webDist);
  if (serveWeb) app.setGlobalPrefix('api');

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

  if (serveWeb) {
    // Hashed build assets are immutable; index.html must always be revalidated
    // so a new deploy is picked up immediately.
    app.useStaticAssets(webDist, {
      index: false,
      setHeaders: (res, filePath) => {
        res.setHeader(
          'Cache-Control',
          filePath.includes('assets')
            ? 'public, max-age=31536000, immutable'
            : 'no-cache',
        );
      },
    });
    // SPA fallback: any GET that is not an API call or a static file (no
    // extension) gets the app shell, so deep links like /savings/3 work.
    app.use((req: Request, res: Response, next: NextFunction) => {
      const looksLikeFile = /\.[a-z0-9]+$/i.test(req.path);
      const isRoute = req.method === 'GET' && !req.path.startsWith('/api') && !looksLikeFile;
      if (!isRoute) return next();
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(join(webDist, 'index.html'));
    });
  }

  app.enableShutdownHooks();
  await app.listen(port);
  Logger.log(
    serveWeb
      ? `Veridian app + API listening on http://localhost:${port} (API under /api)`
      : `Veridian mock API listening on http://localhost:${port}`,
    'Bootstrap',
  );
}

void bootstrap();
