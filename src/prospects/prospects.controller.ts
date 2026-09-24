import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ProspectsService } from './prospects.service';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';

@Controller('prospects')
export class ProspectsController {
  constructor(private readonly prospectsService: ProspectsService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.prospectsService.findAll(query);
  }

  @Get('associates')
  async getAssociates() {
    return this.prospectsService.getAssociates();
  }

  @Post('bulk-assign')
  async bulkAssign(
    @Body('ids') ids: string[],
    @Body('associateName') associateName: string,
    @Body('assignedBy') assignedBy?: string,
  ) {
    return this.prospectsService.bulkAssign(ids, associateName, assignedBy || 'Admin');
  }

  @Patch(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body('associateName') associateName: string,
    @Body('assignedBy') assignedBy?: string,
  ) {
    return this.prospectsService.assign(id, associateName, assignedBy || 'Admin');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prospectsService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateProspectDto) {
    return this.prospectsService.create(createDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateProspectDto) {
    return this.prospectsService.update(id, updateDto);
  }

  @Post(':id/remarks')
  async addRemark(@Param('id') id: string, @Body('note') note: string, @Body('updatedBy') updatedBy?: string) {
    return this.prospectsService.addRemark(id, note, updatedBy);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.prospectsService.delete(id);
  }
}
