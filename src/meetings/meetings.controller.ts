import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.meetingsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateMeetingDto) {
    return this.meetingsService.create(createDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.meetingsService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.meetingsService.delete(id);
  }
}
