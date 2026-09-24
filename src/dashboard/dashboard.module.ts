import { Module } from '@nestjs/common';
import { ProspectsModule } from '../prospects/prospects.module';
import { MeetingsModule } from '../meetings/meetings.module';
import { BuildersModule } from '../builders/builders.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [ProspectsModule, MeetingsModule, BuildersModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
