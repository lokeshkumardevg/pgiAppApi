import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);
  const result = await seedService.seedData(true);
  console.log('Seed completed:', result);
  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
