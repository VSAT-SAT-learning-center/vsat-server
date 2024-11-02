import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamAttemptDto } from './dto/create-examattempt.dto';
import { UpdateExamAttemptDto } from './dto/update-examattempt.dto';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { TargetLearningService } from '../target-learning/target-learning.service';
import { CreateTargetLearningDto } from '../target-learning/dto/create-targetlearning.dto';

@Injectable()
export class ExamAttemptService {
    constructor(
        @InjectRepository(ExamAttempt)
        private readonly examAttemptRepository: Repository<ExamAttempt>,

        private readonly targetLearningService: TargetLearningService,
    ) {}

    async recommend(
        examAttemptId: string,
        createTargetLearningDto: CreateTargetLearningDto,
    ) {
        const examAttempt = await this.examAttemptRepository.findOne({
            where: { id: examAttemptId },
            relations: ['studyProfile'],
        });

        if (examAttempt.scoreMath < 400) {
        } else if (examAttempt.scoreRW < 400) {
            //1TH
            await this.targetLearningService.save(createTargetLearningDto);
        } else if (
            examAttempt.studyProfile.targetscoreMath >= 400 &&
            examAttempt.studyProfile.targetscoreMath < 600
        ) {
            if (examAttempt.scoreMath < 600) {
                //4TH Math
                await this.targetLearningService.save(createTargetLearningDto);
            } else if (examAttempt.scoreRW < 600) {
                //4TH RW
                await this.targetLearningService.save(createTargetLearningDto);
            }
        } else if (
            examAttempt.studyProfile.targetscoreMath >= 600 &&
            examAttempt.studyProfile.targetscoreMath < 800
        ) {
            if (examAttempt.scoreMath < 800) {
                await this.targetLearningService.save(createTargetLearningDto);
                //4TH Math
            } else if (examAttempt.scoreRW < 800) {
                await this.targetLearningService.save(createTargetLearningDto);
                //4TH RW
            }
        } else if (
            examAttempt.studyProfile.targetscoreMath >= 600 &&
            examAttempt.studyProfile.targetscoreMath <= 800
        ) {
            if (examAttempt.scoreMath > 400 && examAttempt.scoreMath < 600) {
                await this.targetLearningService.save(createTargetLearningDto);
                //1TH Math
            } else if (examAttempt.scoreRW > 400 && examAttempt.scoreRW < 600) {
                await this.targetLearningService.save(createTargetLearningDto);
                //1TH Math
            }
        }
    }
}
