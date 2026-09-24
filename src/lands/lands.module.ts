import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Land, LandSchema } from './land.schema';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Land.name, schema: LandSchema }])],
  providers: [LandsService],
  controllers: [LandsController],
  exports: [LandsService],
})
export class LandsModule {}
