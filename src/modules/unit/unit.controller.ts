import { Controller, Get, Post, Body, Param, Patch, Delete, HttpStatus } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto'; // Import SuccessMessages
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  async create(@Body() createUnitDto: CreateUnitDto) {
    try {
      const unit = await this.unitService.create(createUnitDto);
      return ResponseHelper.success(HttpStatus.CREATED, unit, SuccessMessages.create('Unit'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.BAD_REQUEST, 'Failed to create unit');
    }
  }

  @Get()
  async findAll() {
    try {
      const units = await this.unitService.findAll();
      return ResponseHelper.success(HttpStatus.OK, units, SuccessMessages.gets('Units'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve units');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const unit = await this.unitService.findOne(id);
      if (!unit) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Unit not found');
      }
      return ResponseHelper.success(HttpStatus.OK, unit, SuccessMessages.get('Unit'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve unit');
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    try {
      const updatedUnit = await this.unitService.update(id, updateUnitDto);
      return ResponseHelper.success(HttpStatus.OK, updatedUnit, SuccessMessages.update('Unit'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.BAD_REQUEST, 'Failed to update unit');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.unitService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, SuccessMessages.delete('Unit'));
    } catch (error) {
      return ResponseHelper.error(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete unit');
    }
  }
}
