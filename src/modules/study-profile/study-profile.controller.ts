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
import { AssignStudyProfile } from './dto/asign-studyprofile.dto';

@ApiTags('StudyProfiles')
@Controller('study-profiles')
@ApiBearerAuth('JWT-auth')
export class StudyProfileController {
    constructor(private readonly studyProfileService: StudyProfileService) {}

    @Get('/getStudyProfileByAccountId')
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

    @Get('/getStudyProfileWithAccountId')
    @UseGuards(JwtAuthGuard, new RoleGuard(['student', 'admin']))
    async getStudyProfileWithAccountId(
        @Request() req,
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        try {
            const studyProfile =
                await this.studyProfileService.getStudyProfileWithAccountId(
                    req.user.id,
                    page,
                    pageSize,
                );
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

    @Get('getStudyProfile')
    //@UseGuards(JwtAuthGuard)
    async get(@Query('page') page?: number, @Query('pageSize') pageSize?: number) {
        try {
            const studyProfile = await this.studyProfileService.get(page, pageSize);
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

    @Get('getStudyProfileWithTeacherDetail')
    //@UseGuards(JwtAuthGuard)
    async getStudyProfileWithTeacherDetail(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        try {
            const studyProfile =
                await this.studyProfileService.getStudyProfileWithTeacherDetail(
                    page,
                    pageSize,
                );
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

    @Put('assignTeacher')
    @UseGuards(JwtAuthGuard)
    async asignTeacher(@Body() assignStudyProfile: AssignStudyProfile) {
        try {
            const studyProfile =
                await this.studyProfileService.asignTeacher(assignStudyProfile);
            return ResponseHelper.success(
                HttpStatus.OK,
                studyProfile,
                SuccessMessages.create('StudyProfile'),
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

    @Get('getStudyProfileWithTeacher')
    @UseGuards(JwtAuthGuard)
    async getWithTeacher(
        @Request() req,
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        try {
            const studyProfile = await this.studyProfileService.getWithTeacher(
                page,
                pageSize,
                req.user.id,
            );
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

    @Get('getStudyProfileWithTargetLearningDetail')
    @UseGuards(JwtAuthGuard, new RoleGuard(['student']))
    async getStudyProfileWithTargetLearningDetail(@Request() req) {
        try {
            const studyProfile =
                await this.studyProfileService.getStudyProfileWithTargetLearningDetail(
                    req.user.id,
                );
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

    @Get('getStudyProfileWithTargetLearningDetailWithStatus')
    @UseGuards(JwtAuthGuard, new RoleGuard(['student']))
    async getStudyProfileWithTargetLearningDetailWithStatus(@Request() req) {
        try {
            const studyProfile =
                await this.studyProfileService.getStudyProfileWithTargetLearningDetailWithStatus(
                    req.user.id,
                );
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

    @Put('updateStudyProfile/:id')
    async updateStudyProfile(
        @Param('id') id: string,
        @Body() updateStudyProfileDto: UpdateStudyProfileDto,
    ) {
        try {
            const studyProfile = await this.studyProfileService.updateStudyProfile(
                id,
                updateStudyProfileDto,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                studyProfile,
                SuccessMessages.update('StudyProfile'),
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
