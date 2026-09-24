import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { Video } from './video.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('v1/videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  async findAll() {
    return this.videosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: Partial<Video>) {
    return this.videosService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<Video>) {
    return this.videosService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.videosService.remove(id);
    return { success: true };
  }
}
