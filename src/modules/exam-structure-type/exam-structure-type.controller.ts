import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ExamStructureTypeService } from './exam-structure-type.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ExamStructuresType')
@Controller('exam-structure-types')
export class ExamStructureTypeController {
    constructor(
        private readonly examStructureTypeService: ExamStructureTypeService,
    ) {}

    @Get()
    async getAll() {
        try {
            const getExamStructureType =
                await this.examStructureTypeService.get();
            return ResponseHelper.success(
                HttpStatus.OK,
                getExamStructureType,
                SuccessMessages.get('ExamStructureType'),
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
