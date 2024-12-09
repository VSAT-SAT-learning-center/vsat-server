import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    HttpStatus,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CreateUnitAreaDto } from './dto/create-unitarea.dto';
import { UpdateUnitAreaDto } from './dto/update-unitarea.dto';
import { UnitAreaService } from './unit-area.service';
import { SuccessMessages } from 'src/common/message/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { CreateLearningMaterialDto } from './dto/create-learningmaterial.dto';
import { RoleGuard } from 'src/common/guards/role.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';

@ApiTags('UnitAreas')
@Controller('unit-areas')
export class UnitAreaController extends BaseController<UnitArea> {
    constructor(private readonly unitAreaService: UnitAreaService) {
        super(unitAreaService, 'UnitArea');
    }

    @Get('/by-unit/:unitId')
    async getUnitAreasWithLessons(@Param('unitId') unitId: string) {
        const unitAreas = await this.unitAreaService.findByUnitIdWithLessons(unitId);
        return ResponseHelper.success(
            HttpStatus.OK,
            unitAreas,
            'UnitAreas with Lessons retrieved successfully',
        );
    }

    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    @Post('create')
    @ApiBody({ type: CreateLearningMaterialDto })
    async createLearningMaterial(
        @Body() createUnitAreaDtoList: CreateLearningMaterialDto[],
    ) {
        const createdMaterials =
            await this.unitAreaService.createOrUpdateUnitAreas(createUnitAreaDtoList);
        return ResponseHelper.success(
            HttpStatus.CREATED,
            createdMaterials,
            'Learning Material created successfully',
        );
    }
    
}
