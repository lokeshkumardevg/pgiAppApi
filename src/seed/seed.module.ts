import { Module } from '@nestjs/common';
import { ProspectsModule } from '../prospects/prospects.module';
import { MeetingsModule } from '../meetings/meetings.module';
import { BuildersModule } from '../builders/builders.module';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
  imports: [ProspectsModule, MeetingsModule, BuildersModule],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
