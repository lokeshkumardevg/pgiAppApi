import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Page, PageSchema } from './page.schema';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }])],
  providers: [PagesService],
  controllers: [PagesController],
  exports: [PagesService],
})
export class PagesModule {}
