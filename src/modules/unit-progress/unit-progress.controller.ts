import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { UnitProgressService } from './unit-progress.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SyncUnitProgressDto } from './dto/sync-updateprogress.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { TargetLearningService } from '../target-learning/target-learning.service';
@ApiTags('UnitProgress')
@Controller('unit-progress')
export class UnitProgressController extends BaseController<UnitProgress> {
    constructor(
        private readonly unitProgressService: UnitProgressService,
        private readonly targetLearningService: TargetLearningService,
    ) {
        super(unitProgressService, 'UnitProgress');
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
   
    @UseGuards(JwtAuthGuard)
    @Post('multiple-sync')
    @ApiBody({
        description: 'Payload for syncing multiple unit progresses',
        type: SyncUnitProgressDto,
        isArray: true,
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
