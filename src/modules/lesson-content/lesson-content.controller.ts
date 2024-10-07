import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    HttpStatus,
} from '@nestjs/common';
import { LessonContentService } from './lesson-content.service';
import { CreateLessonContentDto } from './dto/create-lessoncontent.dto';
import { UpdateLessonContentDto } from './dto/update-lessoncontent.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { BaseController } from '../base/base.controller';
import { LessonContent } from 'src/database/entities/lessoncontent.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('LessonContents')
@Controller('lesson-contents')
export class LessonContentController extends BaseController<LessonContent> {
    constructor(private readonly lessonContentService: LessonContentService) {
        super(lessonContentService, 'LessonContent');
    }

    @Post()
    async create(@Body() createLessonContentDto: CreateLessonContentDto) {
        try {
            const createdLessonContent =
                await this.lessonContentService.create(createLessonContentDto);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                createdLessonContent,
                SuccessMessages.create('LessonContent'),
            );
        } catch (error) {
            return ResponseHelper.error(
                error,
                HttpStatus.BAD_REQUEST,
                'Failed to create LessonContent',
            );
        }
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateLessonContentDto: UpdateLessonContentDto,
    ) {
        try {
            const updatedLessonContent = await this.lessonContentService.update(
                id,
                updateLessonContentDto,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                updatedLessonContent,
                SuccessMessages.update('LessonContent'),
            );
        } catch (error) {
            return ResponseHelper.error(
                error,
                HttpStatus.BAD_REQUEST,
                'Failed to update LessonContent',
            );
        }
    }
}
