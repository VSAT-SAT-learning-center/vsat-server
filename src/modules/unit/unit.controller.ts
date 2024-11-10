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
} from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { Unit } from 'src/database/entities/unit.entity';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PagedUnitResponseDto, UnitResponseDto } from './dto/get-unit.dto';
import { GetUnitsByUserIdDto } from './dto/get-unit-by-userd.dto';
import { LearningMaterialFeedbackDto } from '../feedback/dto/learning-material-feedback.dto';
import { plainToInstance } from 'class-transformer';
import { UnitWithSkillsDto } from './dto/get-unit-with-domain-skill.dto';

@ApiTags('Units')
@Controller('units')
export class UnitController extends BaseController<Unit> {
    constructor(private readonly unitService: UnitService) {
        super(unitService, 'Unit');
    }

    @Post('/censor/:action')
    async approveOrRejectLearningMaterial(
        @Param('action') action: 'approve' | 'reject',
        @Body() feedbackDto: LearningMaterialFeedbackDto,
    ) {
        if (action !== 'approve' && action !== 'reject') {
            throw new BadRequestException('Invalid action. Use "approve" or "reject".');
        }

        try {
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

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const unit = await this.unitService.findOneById(id, ['unitAreas']);
            return ResponseHelper.success(
                HttpStatus.OK,
                unit,
                SuccessMessages.get('Unit'),
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

    @Post()
    async create(@Body() createUnitDto: CreateUnitDto) {
        const createdUnit = await this.unitService.create(createUnitDto);
        return ResponseHelper.success(
            HttpStatus.CREATED,
            createdUnit,
            SuccessMessages.create('Unit'),
        );
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
        const updatedUnit = await this.unitService.update(id, updateUnitDto);
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedUnit,
            SuccessMessages.update('Unit'),
        );
    }

    @Put(':id')
    async updateUnit(
        @Param('id') id: string,
        @Body() updateUnitStatusDto: UpdateUnitDto,
    ) {
        const updatedLessonContent = await this.unitService.updateUnitStatus(
            id,
            updateUnitStatusDto,
        );
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedLessonContent,
            SuccessMessages.update('Unit'),
        );
    }

    @Get(':unitId/details')
    async getUnitDetails(@Param('unitId') unitId: string): Promise<UnitResponseDto> {
        return await this.unitService.getUnitWithDetails(unitId);
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

    @Post('user/draft')
    async getDraftUnitsWithDetailsByUserId(
        @Body() getUnitsByUserIdDto: GetUnitsByUserIdDto,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
        pageSize: number,
    ): Promise<PagedUnitResponseDto> {
        const { userId } = getUnitsByUserIdDto;

        return this.unitService.getDraftUnitWithDetailsByUserId(page, pageSize, userId);
    }

    @Post('user/pending')
    async getPendingUnitsWithDetailsByUserId(
        @Body() getUnitsByUserIdDto: GetUnitsByUserIdDto,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
        pageSize: number,
    ): Promise<PagedUnitResponseDto> {
        const { userId } = getUnitsByUserIdDto;

        return this.unitService.getPendingUnitWithDetailsByUserId(page, pageSize, userId);
    }

    @Post('user/approve')
    async getApproveUnitsWithDetailsByUserId(
        @Body() getUnitsByUserIdDto: GetUnitsByUserIdDto,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
        pageSize: number,
    ): Promise<PagedUnitResponseDto> {
        const { userId } = getUnitsByUserIdDto;

        return this.unitService.getApproveUnitWithDetailsByUserId(page, pageSize, userId);
    }

    @Post('user/reject')
    async getRejectUnitsWithDetailsByUserId(
        @Body() getUnitsByUserIdDto: GetUnitsByUserIdDto,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
        pageSize: number,
    ): Promise<PagedUnitResponseDto> {
        const { userId } = getUnitsByUserIdDto;

        return this.unitService.getRejectUnitWithDetailsByUserId(page, pageSize, userId);
    }

    @Post('user/:status')
    async getUnitsWithDetailsByUserId(
        @Param('status') status: string,
        @Body() getUnitsByUserIdDto: GetUnitsByUserIdDto,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
        pageSize: number,
    ): Promise<PagedUnitResponseDto> {
        const { userId } = getUnitsByUserIdDto;

        let units;

        // Determine the status and call the appropriate service method
        if (status === 'draft') {
            units = await this.unitService.getDraftUnitWithDetailsByUserId(
                page,
                pageSize,
                userId,
            );
        } else if (status === 'pending') {
            units = await this.unitService.getPendingUnitWithDetailsByUserId(
                page,
                pageSize,
                userId,
            );
        } else if (status === 'approve') {
            units = await this.unitService.getApproveUnitWithDetailsByUserId(
                page,
                pageSize,
                userId,
            );
        } else if (status === 'reject') {
            units = await this.unitService.getRejectUnitWithDetailsByUserId(
                page,
                pageSize,
                userId,
            );
        } else {
            return null;
        }

        return units;
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
