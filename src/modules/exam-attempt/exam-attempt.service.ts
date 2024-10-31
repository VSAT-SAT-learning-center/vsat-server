import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamAttemptDto } from './dto/create-examattempt.dto';
import { UpdateExamAttemptDto } from './dto/update-examattempt.dto';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';

@Injectable()
export class ExamAttemptService {
    constructor(
        @InjectRepository(ExamAttempt)
        private readonly examAttemptRepository: Repository<ExamAttempt>,
        
    ) {}

    async recommend(examAttemptId: string) {
        const examAttempt = await this.examAttemptRepository.findOne({
            where: { id: examAttemptId },
            relations: ['studyProfile'],
        });

        if (examAttempt.scoreMath < 400) {
            //all
        } else if (examAttempt.scoreRW < 400) {
            //all
        } else if (
            examAttempt.studyProfile.targetscoreMath >= 400 &&
            examAttempt.studyProfile.targetscoreMath < 600
        ) {
            if (examAttempt.scoreMath < 600) {
                //4TH Math
            } else if (examAttempt.scoreRW < 600) {
                //4TH RW
            }
        } else if (
            examAttempt.studyProfile.targetscoreMath >= 600 &&
            examAttempt.studyProfile.targetscoreMath < 800
        ) {
            if (examAttempt.scoreMath < 800) {
                //4TH Math
            } else if (examAttempt.scoreRW < 800) {
                //4TH RW
            }
        } else if (
            examAttempt.studyProfile.targetscoreMath >= 600 &&
            examAttempt.studyProfile.targetscoreMath <= 800
        ) {
            if (examAttempt.scoreMath > 400 && examAttempt.scoreMath < 600) {
                //1TH Math
            } else if (examAttempt.scoreRW > 400 && examAttempt.scoreRW < 600) {
                //1TH Math
            }
        }
    }
}
