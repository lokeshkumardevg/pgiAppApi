import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ---- CORS -------------------------------------------------------------
  // Website origins + anything extra from CORS_ORIGINS (comma separated, e.g. CRM frontend URL).
  // Requests without an Origin header (mobile app, Postman, server-to-server) are always allowed.
  const allowedOrigins = [
    'http://localhost:3001',
    'https://www.pgirealtors.com',
    ...(process.env.CORS_ORIGINS || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  ];
  const isDev = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (isDev && /^http:\/\/localhost:\d+$/.test(origin))
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ---- Static uploads (website images/videos) -----------------------------
  const uploadsPath = join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // ---- Mobile routes ------------------------------------------------------
  // /api/mobile/... is rewritten to /api/... so the same controllers serve web + app.
  app.use((req: any, res: any, next: () => void) => {
    if (req.url.startsWith('/api/mobile/')) {
      req.url = req.url.replace('/api/mobile', '/api');
      req.headers['x-client'] = 'mobile';
    }
    next();
  });

  // Web:    /api/...            (CRM: /api/prospects, Website: /api/v1/leads)
  // Mobile: /api/mobile/...
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || process.env.NEST_PORT || 5001;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Backend running at: http://0.0.0.0:${port}/api`);
  logger.log(`📱 Mobile routes at:   http://0.0.0.0:${port}/api/mobile`);
  logger.log(`🖼️  Uploads served from: ${uploadsPath}`);
}

bootstrap();
