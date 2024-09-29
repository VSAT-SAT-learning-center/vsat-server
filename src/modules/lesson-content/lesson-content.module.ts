import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonContent } from 'src/database/entities/lessoncontent.entity';
import { LessonContentController } from './lesson-content.controller';
import { LessonContentService } from './lesson-content.service';

@Module({
  imports: [TypeOrmModule.forFeature([LessonContent])],
  controllers: [LessonContentController],
  providers: [LessonContentService],
})
export class LessonContentModule {}
