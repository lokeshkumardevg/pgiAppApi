import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { HeroService } from './hero.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('v1/hero')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  // Public: the home page hero section reads this on every load.
  @Get()
  async getImages() {
    const images = await this.heroService.getImages();
    return { images };
  }

  // Protected: only the admin dashboard can change which images show.
  @UseGuards(JwtAuthGuard)
  @Put()
  async setImages(@Body('images') images: string[]) {
    const updated = await this.heroService.setImages(
      Array.isArray(images) ? images : [],
    );
    return { images: updated };
  }
}