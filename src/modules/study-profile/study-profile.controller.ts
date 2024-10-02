import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateStudyProfileDto } from './dto/create-studyprofile.dto';
import { UpdateStudyProfileDto } from './dto/update-studyprofile.dto';
import { StudyProfileService } from './study-profile.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('studyprofiles')
export class StudyProfileController {
  constructor(private readonly studyProfileService: StudyProfileService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    try {
      const { data, totalItems, totalPages } = await this.studyProfileService.findAll(paginationOptions);

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
        'Study profiles retrieved successfully',
        paging,
        sorting,
      );
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve study profiles',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const studyProfile = await this.studyProfileService.findOne(id);
      if (!studyProfile) {
        return ResponseHelper.error(null, HttpStatus.NOT_FOUND, 'Study profile not found');
      }
      return ResponseHelper.success(HttpStatus.OK, studyProfile, 'Study profile retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve study profile',
      );
    }
  }

  @Post()
  async create(@Body() createStudyProfileDto: CreateStudyProfileDto) {
    try {
      const studyProfile = await this.studyProfileService.create(createStudyProfileDto);
      return ResponseHelper.success(HttpStatus.CREATED, studyProfile, 'Study profile created successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create study profile',
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateStudyProfileDto: UpdateStudyProfileDto) {
    try {
      const studyProfile = await this.studyProfileService.update(id, updateStudyProfileDto);
      return ResponseHelper.success(HttpStatus.OK, studyProfile, 'Study profile updated successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update study profile',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.studyProfileService.remove(id);
      return ResponseHelper.success(HttpStatus.OK, null, 'Study profile deleted successfully');
    } catch (error) {
      return ResponseHelper.error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete study profile',
      );
    }
  }
}
