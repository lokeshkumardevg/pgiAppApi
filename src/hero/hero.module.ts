import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HeroSettings, HeroSettingsSchema } from './hero.schema';
import { HeroService } from './hero.service';
import { HeroController } from './hero.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HeroSettings.name, schema: HeroSettingsSchema },
    ]),
  ],
  providers: [HeroService],
  controllers: [HeroController],
  exports: [HeroService],
})
export class HeroModule {}