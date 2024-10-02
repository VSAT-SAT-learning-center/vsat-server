import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonContent } from 'src/database/entities/lessoncontent.entity';
import { LessonContentController } from './lesson-content.controller';
import { LessonContentService } from './lesson-content.service';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([LessonContent])],
  controllers: [LessonContentController],
  providers: [LessonContentService, PaginationService],
})
export class LessonContentModule {}
