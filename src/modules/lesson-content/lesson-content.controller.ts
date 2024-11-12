import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { LessonContentService } from './lesson-content.service';
import { CreateLessonContentDto } from './dto/create-lessoncontent.dto';
import { UpdateLessonContentDto } from './dto/update-lessoncontent.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { BaseController } from '../base/base.controller';
import { LessonContent } from 'src/database/entities/lessoncontent.entity';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('LessonContents')
@Controller('lesson-contents')
export class LessonContentController extends BaseController<LessonContent> {
    constructor(private readonly lessonContentService: LessonContentService) {
        super(lessonContentService, 'LessonContent');
    }

    // @Get(':id')
    // async findByLessonId(@Param('id') id: string) {
    //     const lessonContent =
    //         await this.lessonContentService.findByLessonId(id);
    //     return ResponseHelper.success(
    //         HttpStatus.OK,
    //         lessonContent,
    //         SuccessMessages.get('LessonContent'),
    //     );
    // }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const lessonContent = await this.lessonContentService.findOneById(id);
        return ResponseHelper.success(
            HttpStatus.OK,
            lessonContent,
            SuccessMessages.get('LessonContent'),
        );
    }

    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    @Post()
    async create(@Body() createLessonContentDto: CreateLessonContentDto) {
        const createdLessonContent = await this.lessonContentService.create(
            createLessonContentDto,
        );
        return ResponseHelper.success(
            HttpStatus.CREATED,
            createdLessonContent,
            SuccessMessages.create('LessonContent'),
        );
    }

    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateLessonContentDto: UpdateLessonContentDto,
    ) {
        const updatedLessonContent = await this.lessonContentService.update(
            id,
            updateLessonContentDto,
        );
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedLessonContent,
            SuccessMessages.update('LessonContent'),
        );
    }
}
