import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTargetLearningDto } from './dto/create-targetlearning.dto';
import { UpdateTargetLearningDto } from './dto/update-targetlearning.dto';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';

import { BaseService } from '../base/base.service';
import { plainToInstance } from 'class-transformer';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';

@Injectable()
export class TargetLearningService {
    constructor(
        @InjectRepository(TargetLearning)
        private readonly targetLearningRepository: Repository<TargetLearning>,
        @InjectRepository(ExamAttempt)
        private readonly examAttemptRepository: Repository<ExamAttempt>,
    ) {}

    async save(studyProfileId: string, examAttemptId: string) {
        const startdate = new Date();
        const enddate = new Date();
        enddate.setDate(startdate.getDate() + 30);

        const examAttempt = await this.examAttemptRepository.findOne({
            where: { id: examAttemptId },
            relations: ['targetlearning']
        });

        if (!examAttempt) {
            throw new Error('ExamAttempt not found');
        }

        const create = await this.targetLearningRepository.create({
            startdate: new Date(),
            enddate: enddate,
            studyProfile: { id: studyProfileId },
        });

        const saveTarget = await this.targetLearningRepository.save(create);

        examAttempt.targetlearning = saveTarget;
        await this.examAttemptRepository.save(examAttempt);
        return saveTarget;
    }
}
