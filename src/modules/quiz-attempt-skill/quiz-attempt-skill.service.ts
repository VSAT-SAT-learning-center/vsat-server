import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttemptSkill } from 'src/database/entities/quizattemptskill.entity';
import { BaseService } from '../base/base.service';
import { Account } from 'src/database/entities/account.entity';

@Injectable()
export class QuizAttemptSkillService extends BaseService<QuizAttemptSkill> {
    constructor(
        @InjectRepository(QuizAttemptSkill)
        private readonly quizAttemmptSkillRepository: Repository<QuizAttemptSkill>,
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) {
        super(quizAttemmptSkillRepository);
    }

    async getAccountTest() {
        const account = await this.accountRepository.findOne({
            where: { role: { rolename: 'Admin' } },
        });

        return account;
    }
}
