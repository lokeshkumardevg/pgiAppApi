import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProspectsService } from './prospects.service';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';

@Controller('prospects')
export class ProspectsController {
  constructor(private readonly prospectsService: ProspectsService) {}

  @Get('export/csv')
  async exportCsv(@Res() res: any, @Query('associate') associate?: string) {
    const csv = await this.prospectsService.exportCsv(associate);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads_export.csv"');
    return res.send(csv);
  }

  @Post('import')
  async bulkImport(@Body() body: { leads: any[]; defaultAssociate?: string; importedBy?: string }) {
    return this.prospectsService.bulkImport(body.leads, body.defaultAssociate, body.importedBy);
  }

  @Post('import-file')
  @UseInterceptors(FileInterceptor('file'))
  async importFile(
    @UploadedFile() file: any,
    @Body('defaultAssociate') defaultAssociate?: string,
    @Body('importedBy') importedBy?: string,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded. Please attach an Excel (.xlsx, .xls) or CSV (.csv) file.');
      }
      const buffer = file.buffer || (file.path ? require('fs').readFileSync(file.path) : null);
      if (!buffer) {
        throw new BadRequestException('File buffer could not be read.');
      }
      return await this.prospectsService.importFromFile(buffer, defaultAssociate, importedBy);
    } catch (err: any) {
      console.error('Import file error:', err);
      throw new BadRequestException(err?.message || 'Import failed');
    }
  }

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
