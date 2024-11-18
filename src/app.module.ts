import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UnitModule } from './modules/unit/unit.module';
import { LessonContentModule } from './modules/lesson-content/lesson-content.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { UnitAreaModule } from './modules/unit-area/unit-area.module';
import { SectionModule } from './modules/section/section.module';
import { LevelModule } from './modules/level/level.module';
import { ExamQuestionModule } from './modules/examquestion/examquestion.module';
import { QuizQuestionModule } from './modules/quizquestion/quiz-question.module';
import { DomainModule } from './modules/domain/domain.module';
import { DomainDistributionModule } from './modules/domain-distribution/domain-distribution.module';
import { AccountModule } from './modules/account/account.module';
import { CommentModule } from './modules/comment/comment.module';
import { ExamModule } from './modules/exam/exam.module';
import { ExamAttemptModule } from './modules/exam-attempt/exam-attempt.module';
import { ExamAttemptDetailModule } from './modules/exam-attempt-detail/exam-attempt-detail.module';
import { ExamScoreModule } from './modules/exam-score/exam-score.module';
import { ExamScoreDetailModule } from './modules/exam-score-detail/exam-score-detail.module';
import { ExamStructureModule } from './modules/exam-structure/exam-structure.module';
import { ExamTypeModule } from './modules/exam-type/exam-type.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { LessonProgressModule } from './modules/lesson-progress/lesson-progress.module';
import { ModuleTypeModule } from './modules/module-type/module-type.module';
import { QuestionModule } from './modules/question/question.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { QuizAttemptModule } from './modules/quiz-attempt/quiz-attempt.module';
import { QuizAttemptAnswerModule } from './modules/quiz-attempt-answer/quiz-attempt-answer.module';
import { QuizAttemptSkillModule } from './modules/quiz-attempt-skill/quiz-attempt-skill.module';
import { QuizConfigModule } from './modules/quiz-config/quiz-config.module';
import { RoleModule } from './modules/role/role.module';
import { SkillModule } from './modules/skill/skill.module';
import { StudyProfileModule } from './modules/study-profile/study-profile.module';
import { TargetLearningModule } from './modules/target-learning/target-learning.module';
import { UnitAreaProgressModule } from './modules/unit-area-progress/unit-area-progress.module';
import { UnitProgressModule } from './modules/unit-progress/unit-progress.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AnswerModule } from './modules/answer/answer.module';
import { GptModule } from './modules/gpt/gpt.module';
import { FeedbacksGateway } from './modules/nofitication/feedback.gateway';
import { QuizAnswerModule } from './modules/quizanswer/quiz-answer.module';
import { QuizQuestionItemModule } from './modules/quiz-question-item/quiz-question-item.module';
import { ExamStructureTypeModule } from './modules/exam-structure-type/exam-structure-type.module';
import { ExamStructureConfigModule } from './modules/exam-structure-config/exam-structure-config.module';
import { ExamSemesterModule } from './modules/exam-semester/exam-semester.module';
import { DomainDistributionConfigModule } from './modules/domain-distribution-config/domain-distribution-config.module';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditSubscriber } from './common/subscriber/audit.subscriber';
import { PostgresConfigService } from './database/config/postgres.config';
import { TargetLearningDetailModule } from './modules/target-learning-detail/target-learning-detail.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: PostgresConfigService, // Sử dụng PostgresConfigService để đăng ký AuditSubscriber
        }),
        DatabaseModule,
        AccountModule,
        AuthModule,
        CommentModule,
        DomainModule,
        DomainDistributionModule,
        ExamModule,
        ExamAttemptModule,
        ExamAttemptDetailModule,
        ExamScoreModule,
        ExamScoreDetailModule,
        ExamStructureModule,
        ExamTypeModule,
        ExamQuestionModule,
        FeedbackModule,
        LessonModule,
        LessonContentModule,
        LessonProgressModule,
        LevelModule,
        ModuleTypeModule,
        QuestionModule,
        QuizModule,
        QuizAttemptModule,
        QuizAttemptAnswerModule,
        QuizAttemptSkillModule,
        QuizConfigModule,
        QuizQuestionModule,
        RoleModule,
        SectionModule,
        SkillModule,
        StudyProfileModule,
        TargetLearningModule,
        UnitModule,
        UnitAreaModule,
        UnitAreaProgressModule,
        UnitProgressModule,
        AnswerModule,
        GptModule,
        QuizAnswerModule,
        QuizQuestionItemModule,
        ExamStructureTypeModule,
        ExamStructureConfigModule,
        ExamSemesterModule,
        DomainDistributionConfigModule,
        TargetLearningDetailModule,

        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: configService.get<string>('MAIL_USER'),
                        pass: configService.get<string>('MAIL_PASSWORD'),
                    },
                },
                defaults: {
                    from: '"VSAT Center" <no-reply@localhost>',
                },
                //preview: true,
                template: {
                    dir: process.cwd() + '/src/',
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),

        ExamSemesterModule,

        DomainDistributionConfigModule,
    ],
    providers: [FeedbacksGateway],
    // providers: [PaginationService],
    // exports: [PaginationService]
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        console.log(consumer);
        consumer.apply(RequestContextMiddleware).forRoutes('*');
    }
}
