import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    try {
      const { data, totalItems, totalPages } = await this.skillService.findAll(paginationOptions);

      const paging = {
        page: paginationOptions.page,
        pageSize: paginationOptions.pageSize,
        totalItems,
        totalPages,
      }; 

      const sorting = {
        sortBy: paginationOptions.sortBy,
        sortOrder: paginationOptions.sortOrder,
      };

      return ResponseHelper.success(
        HttpStatus.OK,
        data,
        'Skills retrieved successfully',
        paging,
        sorting,
      );
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve skills',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const skill = await this.skillService.findOne(id);
      if (!skill) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Skill not found');
      }
      return ResponseHelper.success(HttpStatus.OK, skill, 'Skill retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve skill',
      );
    }
  }

  @Post()
  async create(@Body() createSkillDto: CreateSkillDto) {
    try {
      const skill = await this.skillService.create(createSkillDto);
      return ResponseHelper.success(HttpStatus.CREATED, skill, 'Skill created successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create skill',
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    try {
      const skill = await this.skillService.update(id, updateSkillDto);
      return ResponseHelper.success(HttpStatus.OK, skill, 'Skill updated successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update skill',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.skillService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, 'Skill deleted successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete skill',
      );
    }
  }
}
