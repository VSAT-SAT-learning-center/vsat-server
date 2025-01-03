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
    UseGuards,
    Request,
} from '@nestjs/common';
import { CreateExamStructureDto } from './dto/create-examstructure.dto';
import { UpdateExamStructureDto } from './dto/update-examstructure.dto';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamStructureService } from './exam-structure.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/message/success-messages';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';

@ApiTags('ExamStructures')
@Controller('exam-structures')
export class ExamStructureController {
    constructor(private readonly examStructureService: ExamStructureService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async save(@Body() createExamStructure: CreateExamStructureDto) {
        try {
            const savedExamStructure =
                await this.examStructureService.save(createExamStructure);
            return ResponseHelper.success(
                HttpStatus.OK,
                savedExamStructure,
                SuccessMessages.create('ExamStructure'),
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

    @Get()
    async getExamStructure(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        try {
            const getExamstructure = await this.examStructureService.get(page, pageSize);
            return ResponseHelper.success(
                HttpStatus.OK,
                getExamstructure,
                SuccessMessages.get('Recommend'),
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

    @Get('getByCreateBy')
    @UseGuards(JwtAuthGuard)
    async getByCreateBy(
        @Request() req,
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        try {
            const getExamstructure = await this.examStructureService.getByCreateBy(
                page,
                pageSize,
                req.user.id,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                getExamstructure,
                SuccessMessages.get('Recommend'),
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
