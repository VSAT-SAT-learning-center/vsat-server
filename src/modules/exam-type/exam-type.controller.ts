import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    Put,
    HttpStatus,
    HttpException,
} from '@nestjs/common';
import { CreateExamTypeDto } from './dto/create-examtype.dto';
import { UpdateExamTypeDto } from './dto/update-examtype.dto';
import { ExamTypeService } from './exam-type.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { ExamType } from 'src/database/entities/examtype.entity';
import { SuccessMessages } from 'src/common/constants/success-messages';

@ApiTags('ExamTypes')
@Controller('exam-types')
export class ExamTypeController {
    constructor(private readonly examTypeService: ExamTypeService) {}

    @Get()
    async getAll(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        try {
            const examTypes = await this.examTypeService.getAll(page, pageSize);
            return ResponseHelper.success(
                HttpStatus.OK,
                examTypes,
                SuccessMessages.get('ExamTypes'),
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

    @Post()
    async save(@Body() createExamTypeDto: CreateExamTypeDto) {
        try {
            const saveExam = await this.examTypeService.save(createExamTypeDto);
            return ResponseHelper.success(
                HttpStatus.OK,
                saveExam,
                SuccessMessages.create('ExamType'),
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

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateExamTypeDto: UpdateExamTypeDto,
    ) {
        try {
            const updateExamType = await this.examTypeService.update(
                id,
                updateExamTypeDto,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                updateExamType,
                SuccessMessages.update('ExamType'),
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
