import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    Put,
    HttpStatus,
    UseGuards,
    HttpException,
    Request,
} from '@nestjs/common';
import { CreateStudyProfileDto } from './dto/create-studyprofile.dto';
import { UpdateStudyProfileDto } from './dto/update-studyprofile.dto';
import { StudyProfileService } from './study-profile.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { SuccessMessages } from 'src/common/constants/success-messages';

@ApiTags('StudyProfiles')
@Controller('study-profiles')
@ApiBearerAuth('JWT-auth')
export class StudyProfileController {
    constructor(private readonly studyProfileService: StudyProfileService) {}

    @Get()
    @UseGuards(JwtAuthGuard, new RoleGuard(['student', 'admin']))
    async getStudyProfileByAccountId(@Request() req) {
        try {
            const studyProfile =
                await this.studyProfileService.getStudyProfileByAccountId(req.user.id);
            return ResponseHelper.success(
                HttpStatus.OK,
                studyProfile,
                SuccessMessages.get('StudyProfile'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }
}
