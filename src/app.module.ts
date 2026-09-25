import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// Realtor CRM
import { ProspectsModule } from './prospects/prospects.module';
import { MeetingsModule } from './meetings/meetings.module';
import { BuildersModule } from './builders/builders.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeedModule } from './seed/seed.module';
import { RbacModule } from './rbac/rbac.module';
import { InventoryModule } from './inventory/inventory.module';

// PGI Realtors website
import { AuthModule } from './auth/auth.module';
import { PagesModule } from './pages/pages.module';
import { LandsModule } from './lands/lands.module';
import { VideosModule } from './videos/videos.module';
import { UploadModule } from './upload/upload.module';
import { HeroModule } from './hero/hero.module';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          configService.get<string>('LOCAL_MONGODB_URI') ||
          'mongodb://localhost:27017/realtorApp',
      }),
      inject: [ConfigService],
    }),

    // CRM
    ProspectsModule,
    MeetingsModule,
    BuildersModule,
    DashboardModule,
    SeedModule,
    RbacModule,
    InventoryModule,

    // Website
    AuthModule,
    PagesModule,
    LandsModule,
    VideosModule,
    UploadModule,
    HeroModule,
    LeadsModule,
  ],
})
export class AppModule {}
