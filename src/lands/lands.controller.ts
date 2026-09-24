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
import { LandsService } from './lands.service';
import { Land } from './land.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('v1/lands')
export class LandsController {
  constructor(private readonly landsService: LandsService) {}

  @Get()
  async findAll() {
    return this.landsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.landsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: Partial<Land>) {
    return this.landsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<Land>) {
    return this.landsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.landsService.remove(id);
    return { success: true };
  }
}
