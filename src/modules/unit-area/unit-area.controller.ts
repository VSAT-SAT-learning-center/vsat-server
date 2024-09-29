import { Controller, Get, Post, Body, Param, Patch, Delete, HttpStatus } from '@nestjs/common';
import { CreateUnitAreaDto } from './dto/create-unitarea.dto';
import { UpdateUnitAreaDto } from './dto/update-unitarea.dto';
import { UnitAreaService } from './unit-area.service';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('unitareas')
export class UnitAreaController {
  constructor(private readonly unitAreaService: UnitAreaService) {}

  @Post()
  async create(@Body() createUnitAreaDto: CreateUnitAreaDto) {
    try {
      const unitArea = await this.unitAreaService.create(createUnitAreaDto);
      return ResponseHelper.success(HttpStatus.CREATED, unitArea, SuccessMessages.create('Unit Area'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.BAD_REQUEST, 'Failed to create unit area');
    }
  }

  @Get()
  async findAll() {
    try {
      const unitAreas = await this.unitAreaService.findAll();
      return ResponseHelper.success(HttpStatus.OK, unitAreas, SuccessMessages.gets('Unit Areas'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve unit areas');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const unitArea = await this.unitAreaService.findOne(id);
      if (!unitArea) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Unit area not found');
      }
      return ResponseHelper.success(HttpStatus.OK, unitArea, SuccessMessages.get('Unit Area'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve unit area');
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUnitAreaDto: UpdateUnitAreaDto) {
    try {
      const updatedUnitArea = await this.unitAreaService.update(id, updateUnitAreaDto);
      return ResponseHelper.success(HttpStatus.OK, updatedUnitArea, SuccessMessages.update('Unit Area'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.BAD_REQUEST, 'Failed to update unit area');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.unitAreaService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, SuccessMessages.delete('Unit Area'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete unit area');
    }
  }
}
