import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UnitModule } from './modules/unit/unit.module';
import { LessonContentModule } from './modules/lesson-content/lesson-content.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { UnitAreaModule } from './modules/unit-area/unit-area.module';
import { SectionModule } from './modules/section/section.module';
import { LevelModule } from './modules/level/level.module';
import { ExamQuestionModule } from './modules/examquestion/examquestion.module';
import { QuizQuestionModule } from './modules/quizquestion/quizquestion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UnitModule,
    UnitAreaModule,
    LessonModule,
    LessonContentModule,
    SectionModule,
    LevelModule,
    ExamQuestionModule,
    QuizQuestionModule,
  ],
})
export class AppModule {}
