import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    HttpStatus,
    Put,
    Query,
    DefaultValuePipe,
    ParseIntPipe,
    BadRequestException,
    HttpException,
    UseGuards,
    Request,
} from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { SuccessMessages } from 'src/common/message/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { Unit } from 'src/database/entities/unit.entity';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PagedUnitResponseDto, UnitResponseDto } from './dto/get-unit.dto';
import { GetUnitsByUserIdDto } from './dto/get-unit-by-userd.dto';
import { LearningMaterialFeedbackDto } from '../feedback/dto/learning-material-feedback.dto';
import { UnitWithSkillsDto } from './dto/get-unit-with-domain-skill.dto';
import { RoleGuard } from 'src/common/guards/role.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { UnitFeedbackResponseDto } from './dto/unit-feedback-detail-response.dto';

@ApiTags('Units')
@Controller('units')
export class UnitController extends BaseController<Unit> {
    constructor(private readonly unitService: UnitService) {
        super(unitService, 'Unit');
    }

    @UseGuards(JwtAuthGuard, new RoleGuard(['manager']))
    @Post('/censor/:action')
    async approveOrRejectLearningMaterial(
        @Param('action') action: 'approve' | 'reject',
        @Body() feedbackDto: LearningMaterialFeedbackDto,
        @Request() req,
    ) {
        if (action !== 'approve' && action !== 'reject') {
            throw new BadRequestException('Invalid action. Use "approve" or "reject".');
        }

        try {
            feedbackDto.accountFromId = req.user.id;
            const feedbacks = this.unitService.approveOrRejectLearningMaterial(
                feedbackDto,
                action,
            );

            return ResponseHelper.success(
                HttpStatus.OK,
                feedbacks,
                SuccessMessages.update('Feedback'),
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

    @Get('/:status')
    async getUnitsWithDetails(
        @Param('status') status: string,
        @Query('page') page: number = 1,
        @Query('pageSize') pageSize: number = 6,
    ) {
        if (!page) {
            page = 1;
        }
        if (!pageSize) {
            pageSize = 6;
        }

        let units;
        try {
            if (status === 'pending') {
                units = await this.unitService.getPendingUnitWithDetails(page, pageSize);
            } else if (status === 'approve') {
                units = await this.unitService.getApproveUnitWithDetails(page, pageSize);
            } else if (status === 'reject') {
                units = await this.unitService.getRejectUnitWithDetails(page, pageSize);
            } else {
                return ResponseHelper.error(
                    null,
                    HttpStatus.BAD_REQUEST,
                    'Invalid status parameter. Must be "pending", "approve", or "reject".',
                );
            }

            return ResponseHelper.success(
                HttpStatus.OK,
                units,
                SuccessMessages.get(
                    `${status.charAt(0).toUpperCase() + status.slice(1)}Unit`,
                ),
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
    

    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    @Get('staff/:status')
    async getUnitsWithDetailsByStaff(
        @Request() req,
        @Param('status') status: string,
        @Query('page') page: number = 1,
        @Query('pageSize') pageSize: number = 6,
    ) {
        if (!page) {
            page = 1;
        }
        if (!pageSize) {
            pageSize = 6;
        }

        const userId = req.user.id;

        let units;
        try {
            if (status === 'pending') {
                units = await this.unitService.getPendingUnitWithDetailsIncludeFeedback(userId, page, pageSize);
            } else if (status === 'approve') {
                units = await this.unitService.getApproveUnitWithDetailsIncludeFeedback(userId, page, pageSize);
            } else if (status === 'reject') {
                units = await this.unitService.getRejectUnitWithDetailsIncludeFeedback(userId, page, pageSize);
            } else {
                return ResponseHelper.error(
                    null,
                    HttpStatus.BAD_REQUEST,
                    'Invalid status parameter. Must be "pending", "approve", or "reject".',
                );
            }

            return ResponseHelper.success(
                HttpStatus.OK,
                units,
                SuccessMessages.get(
                    `${status.charAt(0).toUpperCase() + status.slice(1)}Unit`,
                ),
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

    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    @Post(':id/submit')
    @ApiParam({ name: 'id', required: true, description: 'ID of the unit' })
    async submitLearningMaterial(@Param('id') unitId: string) {
        const unit = await this.unitService.submitLearningMaterial(unitId);

        return ResponseHelper.success(
            HttpStatus.OK,
            unit,
            SuccessMessages.update('Unit'),
        );
    }

    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    @Post()
    async create(@Body() createUnitDto: CreateUnitDto) {
        const createdUnit = await this.unitService.create(createUnitDto);
        return ResponseHelper.success(
            HttpStatus.CREATED,
            createdUnit,
            SuccessMessages.create('Unit'),
        );
    }

    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
        const updatedUnit = await this.unitService.update(id, updateUnitDto);
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedUnit,
            SuccessMessages.update('Unit'),
        );
    }

    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    @Put(':id')
    async updateUnit(
        @Param('id') id: string,
        @Body() updateUnitStatusDto: UpdateUnitDto,
    ) {
        const updatedUnit = await this.unitService.updateUnitStatus(
            id,
            updateUnitStatusDto,
        );
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedUnit,
            SuccessMessages.update('Unit'),
        );
    }

    @Get(':unitId/details')
    async getUnitDetails(@Param('unitId') unitId: string): Promise<UnitResponseDto> {
        return await this.unitService.getUnitWithDetails(unitId);
    }

    @Get('staff/:unitId/details')
    async getStaffUnitDetails(@Param('unitId') unitId: string): Promise<UnitFeedbackResponseDto> {
        return await this.unitService.getOneUnitWithDetailsIncludeFeedback(unitId);
    }

    @Post('user')
    async getAllUnitsWithDetailsByUserId(
        @Body() getUnitsByUserIdDto: GetUnitsByUserIdDto,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
        pageSize: number,
    ): Promise<PagedUnitResponseDto> {
        return this.unitService.getAllUnitsWithDetailsByUserId(
            page,
            pageSize,
            getUnitsByUserIdDto,
        );
    }

    @Get('domain/:id')
    @ApiOperation({ summary: 'Get Unit with Domain and Skill Titles' })
    @ApiResponse({
        status: 200,
        description: 'Unit with Domain and Skill Titles retrieved successfully',
    })
    @ApiResponse({ status: 404, description: 'Unit not found' })
    async getUnitWithDomainAndSkills(
        @Param('id') id: string,
    ): Promise<UnitWithSkillsDto> {
        try {
            const unit = await this.unitService.getUnitWithDomainAndSkills(id);
            return unit;
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.NOT_FOUND,
                    message:
                        error.message || 'An error occurred while retrieving the unit',
                },
                error.status || HttpStatus.NOT_FOUND,
            );
        }
    }
}
