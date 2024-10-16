import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { LearningMaterialService } from './learning-material.service';
import { CreateUnitAreaDto } from '../unit-area/dto/create-unitarea.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@ApiTags('LearningMaterial')
@Controller('learning-material')
export class LearningMaterialController {
    constructor(
        private readonly learningMaterialService: LearningMaterialService,
    ) {}

    @Post('create')
    @ApiBody({
        schema: {
          type: 'array',
          items: { $ref: getSchemaPath(CreateUnitAreaDto) }, // Correctly reference the DTO schema
        },
      })
    async createLearningMaterial(
        @Body() createUnitAreaDtoList: CreateUnitAreaDto[],
    ) {
        const createdMaterials =
            await this.learningMaterialService.createUnitAreaWithLessons(
                createUnitAreaDtoList,
            );
        return ResponseHelper.success(
            HttpStatus.CREATED,
            createdMaterials,
            'Learning Material created successfully',
        );
    }
}
