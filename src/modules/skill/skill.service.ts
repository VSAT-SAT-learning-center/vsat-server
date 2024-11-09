import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from 'src/database/entities/skill.entity';
import { BaseService } from '../base/base.service';
import { SkillDto } from './dto/skill.dto';
import { QuizQuestionService } from '../quizquestion/quiz-question.service';

@Injectable()
export class SkillService extends BaseService<Skill> {
    constructor(
        @InjectRepository(Skill)
        private readonly skillRepository: Repository<Skill>,
    ) {
        super(skillRepository);
    }

    async getSkillsByDomainId(id: string): Promise<SkillDto[]> {
        const skills = await this.skillRepository.find({
            where: { domain: { id: id } },
        });

        if (!skills || skills.length === 0) {
            throw new NotFoundException(`No skills found for domain ID ${id}`);
        }

        return skills.map((skill) => ({
            id: skill.id,
            content: skill.content,
        }));
    }

    async getSkillsByDomainName(name: string): Promise<SkillDto[]> {
        const skills = await this.skillRepository.find({
            where: { domain: { content: name } },
        });

        if (!skills || skills.length === 0) {
            throw new NotFoundException(`No skills found for domain ID ${name}`);
        }

        return skills.map((skill) => ({
            id: skill.id,
            content: skill.content,
        }));
    }
}
