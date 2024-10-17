import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { LearningMaterialService } from './learning-material.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { CreateLearningMaterialDto } from './dto/create-learningmaterial.dto';

@ApiTags('LearningMaterial')
@Controller('learning-material')
export class LearningMaterialController {
    constructor(
        private readonly learningMaterialService: LearningMaterialService,
    ) {}

    // @Post('create')
    // @ApiBody({
    //     schema: {
    //       type: 'array',
    //       items: { $ref: getSchemaPath(CreateLearningMaterialDto) }, // Correctly reference the DTO schema
    //     },
    //   })
    // async createLearningMaterial(
    //     @Body() createUnitAreaDtoList: CreateLearningMaterialDto[],
    // ) {
    //     const createdMaterials =
    //         await this.learningMaterialService.createUnitAreaWithLessons(
    //             createUnitAreaDtoList,
    //         );
    //     return ResponseHelper.success(
    //         HttpStatus.CREATED,
    //         createdMaterials,
    //         'Learning Material created successfully',
    //     );
    // }
}
