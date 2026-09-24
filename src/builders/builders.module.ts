import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Builder, BuilderSchema } from './schemas/builder.schema';
import { BuildersController } from './builders.controller';
import { BuildersService } from './builders.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Builder.name, schema: BuilderSchema }]),
  ],
  controllers: [BuildersController],
  providers: [BuildersService],
  exports: [BuildersService, MongooseModule],
})
export class BuildersModule {}
