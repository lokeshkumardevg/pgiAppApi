import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('v1/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get(':slug')
  async getPage(@Param('slug') slug: string) {
    const page = await this.pagesService.findBySlug(slug);
    return { title: page.title, html: page.htmlContent };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Query('limit') limit = 20) {
    const pages = await this.pagesService.findAll();
    return pages.slice(0, limit);
  }
}
