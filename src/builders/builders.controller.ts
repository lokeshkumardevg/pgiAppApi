import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { BuildersService } from './builders.service';

@Controller('builders')
export class BuildersController {
  constructor(private readonly buildersService: BuildersService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.buildersService.findAll(search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.buildersService.findOne(id);
  }

  @Post()
  async create(@Body('name') name: string, @Body('projects') projects?: string[]) {
    return this.buildersService.create(name, projects);
  }

  @Post(':id/projects')
  async addProject(@Param('id') id: string, @Body('project') project: string) {
    return this.buildersService.addProject(id, project);
  }
}
