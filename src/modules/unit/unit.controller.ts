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
} from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { Unit } from 'src/database/entities/unit.entity';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { PagedUnitResponseDto, UnitResponseDto } from './dto/get-unit.dto';
import { GetUnitsByUserIdDto } from './dto/get-unit-by-userd.dto';
import { LearningMaterialFeedbackDto } from '../feedback/dto/learning-material-feedback.dto';

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
            throw new BadRequestException(
                'Invalid action. Use "approve" or "reject".',
            );
        }
        const feedbacks = this.unitService.approveOrRejectLearningMaterial(
            feedbackDto,
            action,
        );

        return ResponseHelper.success(
            HttpStatus.OK,
            feedbacks,
            SuccessMessages.update('Feedback'),
        );
    }

    @Get('/pending')
    async getPendingUnitWithDetails(
        @Query('page') page: number = 1,
        @Query('pageSize') pageSize: number = 10,
    ) {
        if ((page = null)) {
            page = 1;
        }
        if ((pageSize = null)) {
            pageSize = 10;
        }

        const pendingUnits = await this.unitService.getPendingUnitWithDetails(
            page,
            pageSize,
        );

        return ResponseHelper.success(
            HttpStatus.OK,
            pendingUnits,
            SuccessMessages.get('PendingUnit'),
        );
    }

    @Get('/approve')
    async getApproveUnitWithDetails(
        @Query('page') page: number = 1,
        @Query('pageSize') pageSize: number = 10,
    ) {
        if ((page = null)) {
            page = 1;
        }
        if ((pageSize = null)) {
            pageSize = 10;
        }

        const approveUnits = await this.unitService.getApproveUnitWithDetails(
            page,
            pageSize,
        );

        return ResponseHelper.success(
            HttpStatus.OK,
            approveUnits,
            SuccessMessages.get('PendingUnit'),
        );
    }

    @Get('/reject')
    async getUnitPendingDetails(
        @Query('page') page: number = 1,
        @Query('pageSize') pageSize: number = 10,
    ) {
        if ((page = null)) {
            page = 1;
        }
        if ((pageSize = null)) {
            pageSize = 10;
        }

        const rejectUnits = await this.unitService.getRejectUnitWithDetails(
            page,
            pageSize,
        );

        return ResponseHelper.success(
            HttpStatus.OK,
            rejectUnits,
            SuccessMessages.get('PendingUnit'),
        );
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        console.log('id call');
        const unit = await this.unitService.findOneById(id, ['unitAreas']);
        return ResponseHelper.success(
            HttpStatus.OK,
            unit,
            SuccessMessages.get('Unit'),
        );
    }

    @Post(':id/submit')
    @ApiParam({ name: 'id', required: true, description: 'ID of the unit' }) // Swagger parameter
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
    async update(
        @Param('id') id: string,
        @Body() updateUnitDto: UpdateUnitDto,
    ) {
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

    async getUnitDetails(
        @Param('unitId') unitId: string,
    ): Promise<UnitResponseDto> {
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

        return this.unitService.getDraftUnitWithDetailsByUserId(
            page,
            pageSize,
            userId,
        );
    }

    @Post('user/pending')
    async getPendingUnitsWithDetailsByUserId(
        @Body() getUnitsByUserIdDto: GetUnitsByUserIdDto,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
        pageSize: number,
    ): Promise<PagedUnitResponseDto> {
        const { userId } = getUnitsByUserIdDto;

        return this.unitService.getPendingUnitWithDetailsByUserId(
            page,
            pageSize,
            userId,
        );
    }

    @Post('user/approve')
    async getApproveUnitsWithDetailsByUserId(
        @Body() getUnitsByUserIdDto: GetUnitsByUserIdDto,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
        pageSize: number,
    ): Promise<PagedUnitResponseDto> {
        const { userId } = getUnitsByUserIdDto;

        return this.unitService.getApproveUnitWithDetailsByUserId(
            page,
            pageSize,
            userId,
        );
    }

    @Post('user/reject')
    async getRejectUnitsWithDetailsByUserId(
        @Body() getUnitsByUserIdDto: GetUnitsByUserIdDto,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
        pageSize: number,
    ): Promise<PagedUnitResponseDto> {
        const { userId } = getUnitsByUserIdDto;

        return this.unitService.getRejectUnitWithDetailsByUserId(
            page,
            pageSize,
            userId,
        );
    }
}
