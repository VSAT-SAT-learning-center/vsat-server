import {
    forwardRef,
    HttpException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTargetLearningDto } from './dto/create-targetlearning.dto';
import { UpdateTargetLearningDto } from './dto/update-targetlearning.dto';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';

import { BaseService } from '../base/base.service';
import { plainToInstance } from 'class-transformer';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { ExamAttemptService } from '../exam-attempt/exam-attempt.service';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { TargetLearningStatus } from 'src/common/enums/target-learning-status.enum';

@Injectable()
export class TargetLearningService extends BaseService<TargetLearning> {
    constructor(
        @InjectRepository(TargetLearning)
        private readonly targetLearningRepository: Repository<TargetLearning>,
        @InjectRepository(ExamAttempt)
        private readonly examAttemptRepository: Repository<ExamAttempt>,
        @InjectRepository(StudyProfile)
        private readonly studyProfileRepository: Repository<StudyProfile>,

        @Inject(forwardRef(() => ExamAttemptService))
        private readonly examAttemptService: ExamAttemptService,
    ) {
        super(targetLearningRepository);
    }

    async save(studyProfileId: string, examAttemptId: string) {
        const startdate = new Date();
        const enddate = new Date();
        enddate.setDate(startdate.getDate() + 30);

        const examAttempt = await this.examAttemptRepository.findOne({
            where: { id: examAttemptId },
            relations: ['targetlearning'],
        });

        if (!examAttempt) {
            throw new Error('ExamAttempt not found');
        }

        const create = await this.targetLearningRepository.create({
            startdate: new Date(),
            enddate: enddate,
            studyProfile: { id: studyProfileId },
            status: TargetLearningStatus.ACTIVE,
        });

        const saveTarget = await this.targetLearningRepository.save(create);

        examAttempt.targetlearning = saveTarget;
        await this.examAttemptRepository.save(examAttempt);
        return saveTarget;
    }

    async getWithExamAttempt(targetLearningId: string) {
        const targetLearning = await this.targetLearningRepository.findOne({
            where: { id: targetLearningId },
            relations: ['studyProfile', 'examattempt'],
        });

        if (!targetLearning.examattempt) {
            throw new Error('ExamAttempt not found for the given TargetLearning');
        }

        const examAttemptId = targetLearning.examattempt.id;

        const examStatistics =
            await this.examAttemptService.getExamAttemptStatistics(examAttemptId);

        return {
            examStatistics,
        };
    }

    async getTargetLearningByStudyProfile(studyProfileId: string) {
        const targetLearning = await this.targetLearningRepository.find({
            where: { studyProfile: { id: studyProfileId } },
            relations: ['targetlearningdetail'],
        });

        return targetLearning;
    }

    async createMultipleTargetLearning(studyProfileIds: string[]) {
        if (!studyProfileIds || studyProfileIds.length === 0) {
            throw new Error('No studyProfileIds provided');
        }

        const targetArrs = [];

        for (const targetData of studyProfileIds) {
            const create = this.targetLearningRepository.create({
                studyProfile: { id: targetData },
            });

            targetArrs.push(create);
        }

        return await this.targetLearningRepository.save(targetArrs);
    }

    async updateTargetLearningStatus(targetLearningId: string, status: TargetLearningStatus) {
        const targetLearning = await this.targetLearningRepository.findOneBy({
            id: targetLearningId
        });

        if (!targetLearning) {
            throw new NotFoundException('TargetLearning not found');
        }

        targetLearning.status = status;
        return await this.targetLearningRepository.save(targetLearning);
    }
}
