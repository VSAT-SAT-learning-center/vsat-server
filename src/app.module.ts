import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
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
        SectionModule,
        LevelModule,
        ExamQuestionModule,
        QuizQuestionModule,
    ],
})
export class AppModule {}
