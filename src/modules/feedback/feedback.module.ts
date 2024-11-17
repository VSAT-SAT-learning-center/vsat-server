import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Feedback } from 'src/database/entities/feedback.entity';
import { AccountModule } from '../account/account.module';
import { LessonModule } from '../lesson/lesson.module';
import { FeedbacksGateway } from '../nofitication/feedback.gateway';
import { ModuleTypeModule } from '../module-type/module-type.module';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [
        TypeOrmModule.forFeature([Feedback]),
        // ExamModule,
        AccountModule,
        ModuleTypeModule,
        forwardRef(() => LessonModule),
    ],
    providers: [FeedbackService, FeedbacksGateway, JwtService],
    controllers: [FeedbackController],
    exports: [FeedbackService],
})
export class FeedbackModule {}
