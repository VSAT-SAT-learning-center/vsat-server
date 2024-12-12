import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from 'src/database/entities/quiz.entity';
import { Repository } from 'typeorm';
import { QuizConfigService } from '../quiz-config/quiz-config.service';
import { QuizQuestionService } from '../quizquestion/quiz-question.service';
import { BaseService } from '../base/base.service';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { UnitService } from '../unit/unit.service';
import { QuizQuestionItemService } from '../quiz-question-item/quiz-question-item.service';

@Injectable()
export class QuizService extends BaseService<Quiz> {
    constructor(
        @InjectRepository(Quiz)
        private readonly quizRepository: Repository<Quiz>,
        private readonly unitService: UnitService,
        private readonly quizConfigService: QuizConfigService,
        private readonly quizQuestionService: QuizQuestionService,
        private readonly quizQuestionItemService: QuizQuestionItemService,
    ) {
        super(quizRepository);
    }

    async createQuiz(unitId: string): Promise<Quiz> {
        const unit = await this.unitService.findOneById(unitId, ['level']);

        if (!unit) {
            throw new NotFoundException(`Unit with ID ${unitId} not found`);
        }

        const quizConfigs = await this.quizConfigService.findConfigsByUnitId(unitId);

        if (!quizConfigs) {
            throw new NotFoundException(`QuizConfig not found for unit ID: ${unitId}`);
        }

        const quizQuestions: QuizQuestion[] = [];

        const levelId = unit.level.id;

        for (const config of quizConfigs) {
            const skillId = config.skill.id;
            const questionQuantity = config.totalquestion;

            const questions =
                await this.quizQuestionService.getRandomQuizQuestionsByLevelAndSkill(
                    levelId,
                    skillId,
                    questionQuantity,
                );

            quizQuestions.push(...questions);
        }

        const quiz = this.quizRepository.create({
            unit: { id: unitId },
            totalquestion: quizQuestions.length
        });

        const createQuiz = await this.quizRepository.save(quiz);

        //Insert quiz question
        await this.quizQuestionItemService.insertQuizQuestionItems(createQuiz.id, quizQuestions);

        return createQuiz; 
    }

    async getCurrentUnitForQuiz(quizId: string): Promise<any> {
        const quiz = await this.quizRepository.findOne({
            where: { id: quizId },
            relations: ['unit'],
        });
    
        if (!quiz || !quiz.unit) {
            throw new NotFoundException(`Unit can not found for Quiz with ID ${quizId}`);
        }
    
        return quiz.unit;
    }
    
}
