import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateStudyProfileDto } from './dto/create-studyprofile.dto';
import { UpdateStudyProfileDto } from './dto/update-studyprofile.dto';
import { StudyProfileService } from './study-profile.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('StudyProfiles')
@Controller('study-profiles')
export class StudyProfileController extends BaseController<StudyProfile> {
  constructor(studyProfileService: StudyProfileService) {
    super(studyProfileService, 'StudyProfile');
  }
}
