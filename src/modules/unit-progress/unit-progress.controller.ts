import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { UnitProgressService } from './unit-progress.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/message/success-messages';
import { CreateUnitProgressDto } from './dto/create-unitprogress.dto';
import { UpdateUnitProgressDto } from './dto/update-unitprogress.dto';
import { SyncUnitProgressDto } from './dto/sync-updateprogress.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { TargetLearningService } from '../target-learning/target-learning.service';

@ApiTags('UnitProgress')
@Controller('unit-progress')
//@UseGuards(JwtAuthGuard)
export class UnitProgressController extends BaseController<UnitProgress> {
    constructor(
        private readonly unitProgressService: UnitProgressService,
        private readonly targetLearningService: TargetLearningService,
    ) {
        super(unitProgressService, 'UnitProgress');
    }

    @Get('details/:unitProgressId')
    @ApiOperation({ summary: 'Get unit progress detail' })
    async getUnitProgressDetail(@Param('unitProgressId') unitProgressId: string) {
        try {
            const unitProgressDetail =
                await this.unitProgressService.getUnitProgressDetail(unitProgressId);

            return ResponseHelper.success(
                HttpStatus.OK,
                unitProgressDetail,
                'UnitProgress detail retrieved successfully',
            );
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get(':targetLearningDetailId')
    @ApiOperation({ summary: 'Get all unit progress in target learning details' })
    async getAllUnitProgress(
        @Param('targetLearningDetailId') targetLearningDetailId: string,
    ) {
        try {
            const unitProgressDetail =
                await this.unitProgressService.getAllUnitProgress(targetLearningDetailId);

            return ResponseHelper.success(
                HttpStatus.OK,
                unitProgressDetail,
                'UnitProgress list retrieved successfully',
            );
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    // @Get(':unitProgressId')
    // async getLessonsByUnitProgress(@Param('unitProgressId') unitProgressId: string) {
    //     try {
    //         const unitProgressDetail =
    //             await this.unitProgressService.getLessonsByUnitProgress(unitProgressId);

    //         return ResponseHelper.success(
    //             HttpStatus.OK,
    //             unitProgressDetail,
    //             'UnitProgress detail retrieved successfully',
    //         );
    //     } catch (error) {
    //         throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    //     }
    // }

    @Post()
    async create(@Body() createUnitProgressDto: CreateUnitProgressDto) {
        const createdUnit = await this.unitProgressService.create(createUnitProgressDto);
        return ResponseHelper.success(
            HttpStatus.CREATED,
            createdUnit,
            SuccessMessages.create('UnitProgress'),
        );
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUnitProgressDto: UpdateUnitProgressDto,
    ) {
        const updatedUnit = await this.unitProgressService.update(
            id,
            updateUnitProgressDto,
        );
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedUnit,
            SuccessMessages.update('UnitProgress'),
        );
    }

    // @Post('sync')
    // @ApiBody({
    //     description: 'Payload for syncing unit progresses',
    //     type: SyncUnitProgressDto,
    // })
    // @ApiOperation({ summary: 'Sync unit progresses' })
    // @UseGuards(JwtAuthGuard, new RoleGuard(['staff', 'teacher']))
    // async syncUnitProgress(@Body() syncUnitProgressDto: SyncUnitProgressDto) {
    //     const { targetLearningDetailId, unitProgresses } = syncUnitProgressDto;
    //     const result = [];
    //     try {
    //         await this.unitProgressService.syncUnitProgress(
    //             targetLearningDetailId,
    //             unitProgresses,
    //         );

    //         return ResponseHelper.success(
    //             HttpStatus.OK,
    //             result,
    //             'Unit progress synchronized successfully',
    //         );
    //     } catch (error) {
    //         throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    //     }
    // }

    //@UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    @Post('multiple-sync')
    @ApiBody({
        description: 'Payload for syncing multiple unit progresses',
        type: SyncUnitProgressDto, // Directly refer to the DTO
        isArray: true, // Since the method expects an array of SyncUnitProgressDto
    })
    @UseGuards(JwtAuthGuard, new RoleGuard(['staff', 'teacher']))
    @ApiOperation({ summary: 'Sync multiple unit progresses' })
    async syncMultipleUnitProgress(
        @Request() req,
        @Body() syncUnitProgressesDto: SyncUnitProgressDto[],
    ) {
        try {
            const userId = req?.user.id;
            const results = await Promise.all(
                syncUnitProgressesDto.map((dto) =>
                    this.unitProgressService.syncUnitProgress(
                        dto.targetLearningId,
                        dto.sectionId,
                        dto.unitProgresses,
                    ),
                ),
            );

            await this.targetLearningService.approveTargetLearningNotification(
                syncUnitProgressesDto[0].targetLearningId,
                userId,
            );

            return ResponseHelper.success(
                HttpStatus.OK,
                results,
                'Unit progress synchronized successfully',
            );
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
}
