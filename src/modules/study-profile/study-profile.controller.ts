import {
    Controller,
    Get,
    Post,
    Body,
    Param,
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
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { SuccessMessages } from 'src/common/message/success-messages';
import { AssignStudyProfile } from './dto/asign-studyprofile.dto';
import { StudyProfileStatus } from 'src/common/enums/study-profile-status.enum';
import { AccountDto } from 'src/common/dto/common.dto';

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

    @Get('/getStudyProfileByAccountIdAndStatus/:status')
    @UseGuards(JwtAuthGuard, new RoleGuard(['student', 'admin']))
    async getStudyProfileByAccountIdAndStatus(
        @Request() req,
        @Param('status') status: StudyProfileStatus,
    ) {
        try {
            const studyProfile =
                await this.studyProfileService.getStudyProfileByAccountIdAndStatus(
                    req.user.id,
                    status,
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

    @Get('getStudyProfileComplete')
    //@UseGuards(JwtAuthGuard)
    async getStudyProfileComplete(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        try {
            const studyProfile = await this.studyProfileService.getStudyProfileComplete(
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
    async assignTeacher(@Request() req, @Body() assignStudyProfile: AssignStudyProfile) {
        try {
            const accountFromId = req.user.id;

            const studyProfile = await this.studyProfileService.assignTeacher(
                accountFromId,
                assignStudyProfile,
            );
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
        @Query('status') status?: StudyProfileStatus,
    ) {
        try {
            const studyProfile = await this.studyProfileService.getWithTeacher(
                page,
                pageSize,
                req.user.id,
                status,
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

    @Get('getStudyProfileCompleteByTeacher')
    @UseGuards(JwtAuthGuard)
    async getStudyProfileCompleteByTeacher(
        @Request() req,
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        try {
            const studyProfile =
                await this.studyProfileService.getStudyProfileCompleteByTeacher(
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

    @Put('updateStudyProfileStatus/:status')
    @UseGuards(JwtAuthGuard)
    async updateStudyProfileStatus(
        @Request() req,
        @Param('status') status: StudyProfileStatus,
    ) {
        try {
            const studyProfile = await this.studyProfileService.updateStudyProfileStatus(
                req.user.id,
                status,
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

    @Post('createStudyProfile')
    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    async createStudyProfile(@Body() createStudyProfile: CreateStudyProfileDto) {
        try {
            const studyProfile =
                await this.studyProfileService.createStudyProfile(createStudyProfile);
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

    @Get('teacher-info')
    @UseGuards(JwtAuthGuard)
    async getTeacherInfo(@Request() req): Promise<AccountDto> {
        const accountId = req?.user.id;
        return this.studyProfileService.getTeacherInfoByAccountId(accountId);
    }

    @Get('learningProgressStatistics')
    @UseGuards(JwtAuthGuard, new RoleGuard(['teacher']))
    async getCombinedProgress(@Request() req) {
        const teacherId = req.user.id; // Extract teacher ID from JWT or session
        return this.studyProfileService.getCombinedLearningProgress(teacherId);
    }

    @Get('examAttemptStatistics')
    @UseGuards(JwtAuthGuard, new RoleGuard(['teacher']))
    async getExamOverview(@Request() req) {
        const teacherId = req.user.id; // Extract teacher ID from JWT or session
        return this.studyProfileService.getExamOverview(teacherId);
    }

    @Get('teacherDashboard')
    @UseGuards(JwtAuthGuard, new RoleGuard(['teacher']))
    async getDashboard(@Request() req) {
        const teacherId = req.user.id; 
        return this.studyProfileService.getTeacherDashboard(teacherId);
    }
}
