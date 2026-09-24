import { Controller, Post, Query } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('import-renu')
  async importRenu(@Query('force') force?: string) {
    return this.seedService.seedData(force === 'true' || force === '1');
  }
}
