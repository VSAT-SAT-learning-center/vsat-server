import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from 'src/database/entities/lesson.entity';
import { BaseService } from '../base/base.service';
import { UnitAreaService } from '../unit-area/unit-area.service';

@Injectable()
export class LessonService extends BaseService<Lesson> {
    constructor(
        @InjectRepository(Lesson)
        private readonly lessonRepository: Repository<Lesson>,
        private readonly unitAreaService: UnitAreaService,
    ) {
        super(lessonRepository);
    }

    async findByUnitArea(unitAreaId: string): Promise<Lesson[]> {
        return this.lessonRepository.find({
            where: { unitArea: { id: unitAreaId } },
        });
    }

    async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
        const { unitAreaId, ...lessonData } = createLessonDto;

        const unitArea = await this.unitAreaService.findOne(unitAreaId);
        if (!unitArea) {
            throw new Error('UnitArea not found');
        }

        const newLesson = this.lessonRepository.create({
            ...lessonData,
            unitArea: unitArea,
        });

        return await this.lessonRepository.save(newLesson);
    }

    async update(
        id: string,
        updateLessonDto: UpdateLessonDto,
    ): Promise<Lesson> {
        const { unitAreaId, ...lessonData } = updateLessonDto;

        const lesson = await this.findOne(id);
        if (!lesson) {
            throw new Error('Lesson not found');
        }

        const unitArea = await this.unitAreaService.findOne(unitAreaId);
        if (!unitArea) {
            throw new Error('Unit Area not found');
        }

        const updatedLesson = await this.lessonRepository.save({
            ...lesson,
            ...lessonData,
            unitArea: unitArea,
        });

        return updatedLesson;
    }
}
