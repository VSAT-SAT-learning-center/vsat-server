import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { BaseService } from '../base/base.service';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';

@Injectable()
export class StudyProfileService {
    constructor(
        @InjectRepository(StudyProfile)
        private readonly studyProfileRepository: Repository<StudyProfile>,
    ) {}

    async getStudyProfileByAccountId(accountId: string) {
        return await this.studyProfileRepository.find({
            where: { account: { id: accountId } },
        });
    }
}
