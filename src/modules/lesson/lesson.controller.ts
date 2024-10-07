import {
    Controller,
    Post,
    Body,
    Param,
    Patch,
    HttpStatus,
    Get,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { BaseController } from '../base/base.controller';
import { Lesson } from 'src/database/entities/lesson.entity';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUnitDto } from '../unit/dto/update-unit.dto';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonController extends BaseController<Lesson> {
    constructor(private readonly lessonService: LessonService) {
        super(lessonService, 'Lesson');
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const unit = await this.lessonService.findOne(id, ['lessonContents']);
        return ResponseHelper.success(
            HttpStatus.OK,
            unit,
            SuccessMessages.get('Lesson'),
        );
    }

    @Post()
    async create(@Body() createLessonDto: CreateLessonDto) {
        const createdUnit = await this.lessonService.create(createLessonDto);
        return ResponseHelper.success(
            HttpStatus.CREATED,
            createdUnit,
            SuccessMessages.create('Lesson'),
        );
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUnitDto: UpdateUnitDto,
    ) {
        const updatedUnit = await this.lessonService.update(id, updateUnitDto);
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedUnit,
            SuccessMessages.update('Lesson'),
        );
    }
}

