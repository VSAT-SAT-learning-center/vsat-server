import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessonContent } from 'src/database/entities/lessoncontent.entity';
import { Repository } from 'typeorm';
import { CreateLessonContentDto } from './dto/create-lessoncontent.dto';
import { UpdateLessonContentDto } from './dto/update-lessoncontent.dto';

@Injectable()
export class LessonContentService {
  constructor(
    @InjectRepository(LessonContent)
    private readonly lessonContentRepository: Repository<LessonContent>,
  ) {}

  create(createLessonContentDto: CreateLessonContentDto): Promise<LessonContent> {
    const lessonContent = this.lessonContentRepository.create(createLessonContentDto);
    return this.lessonContentRepository.save(lessonContent);
  }

  findAll(): Promise<LessonContent[]> {
    return this.lessonContentRepository.find();
  }

  findOne(id: string): Promise<LessonContent> {
    return this.lessonContentRepository.findOne({ where: { id } });
  }

  update(id: string, updateLessonContentDto: UpdateLessonContentDto): Promise<LessonContent> {
    return this.lessonContentRepository.save({ ...updateLessonContentDto, id });
  }

  remove(id: string): Promise<void> {
    return this.lessonContentRepository.delete(id).then(() => {});
  }
}
