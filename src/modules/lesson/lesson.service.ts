import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from 'src/database/entities/lesson.entity';
import { Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const lesson = this.lessonRepository.create(createLessonDto);
    return this.lessonRepository.save(lesson);
  }

  findAll(): Promise<Lesson[]> {
    return this.lessonRepository.find();
  }

  findOne(id: string): Promise<Lesson> {
    return this.lessonRepository.findOne({ where: { id } });
  }

  update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    return this.lessonRepository.save({ ...updateLessonDto, id });
  }

  remove(id: string): Promise<void> {
    return this.lessonRepository.delete(id).then(() => {});
  }
}
