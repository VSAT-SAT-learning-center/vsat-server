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

    // async save(createQuizDto: CreateQuizDto): Promise<Quiz> {
    //     const unitExists = await this.unitRepository.findOne({
    //         where: { id: createQuizDto.unitId },
    //     });

    //     if (!unitExists) {
    //         throw new NotFoundException(
    //             `Unit with ID ${createQuizDto.unitId} does not exist`,
    //         );
    //     }

    //     const quiz = this.quizRepository.create({
    //         ...createQuizDto,
    //         unit: unitExists,
    //         status: false,
    //     });

    //     const saveQuiz = await this.quizRepository.save(quiz);

    //     return saveQuiz;
    // }

    // async updateQuiz(
    //     id: string,
    //     updateQuizDto: UpdateQuizDto,
    // ): Promise<UpdateQuizDto> {
    //     const quiz = await this.quizRepository.findOne({
    //         where: { id },
    //     });

    //     if (!quiz) {
    //         throw new NotFoundException(`Quiz with ID ${id} not found`);
    //     }

    //     if (updateQuizDto.unitId) {
    //         const unitExists = await this.unitRepository.findOne({
    //             where: { id: updateQuizDto.unitId },
    //         });

    //         if (!unitExists) {
    //             throw new NotFoundException(
    //                 `Unit with ID ${updateQuizDto.unitId} does not exist`,
    //             );
    //         }

    //         quiz.unit = unitExists;
    //     }

    //     Object.assign(quiz, updateQuizDto);

    //     return plainToInstance(
    //         UpdateQuizDto,
    //         await this.quizRepository.save(quiz),
    //         { excludeExtraneousValues: true },
    //     );
    // }

    // async getAllQuizzes(page: number, pageSize: number): Promise<any> {
    //     const skip = (page - 1) * pageSize;

    //     const [quizzes, total] = await this.quizRepository.findAndCount({
    //         relations: ['unit'],
    //         skip: skip,
    //         take: pageSize,
    //     });

    //     const totalPages = Math.ceil(total / pageSize);

    //     return {
    //         data: plainToInstance(GetQuizDto, quizzes, {
    //             excludeExtraneousValues: true,
    //         }),
    //         totalPages: totalPages,
    //         currentPage: page,
    //         totalItems: total,
    //     };
    // }

    // async getById(id: string): Promise<GetQuizDto> {
    //     const quiz = await this.quizRepository.findOne({
    //         where: { id },
    //         relations: ['unit'],
    //     });

    //     if (!quiz) {
    //         throw new NotFoundException(`Quiz with ID ${id} not found`);
    //     }

    //     return plainToInstance(GetQuizDto, quiz, {
    //         excludeExtraneousValues: true,
    //     });
    // }

    async createQuiz(unitId: string): Promise<Quiz> {
        // Step 1: Get the quiz by unitId
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

        //Get random question by level and skill
        for (const config of quizConfigs) {
            const skillId = config.skill.id;
            const questionQuantity = config.totalquestion;

            // Fetch questions based on skillId and levelId
            const questions =
                await this.quizQuestionService.getRandomQuizQuestionsByLevelAndSkill(
                    levelId,
                    skillId,
                    questionQuantity,
                );

            // Append the questions to the main list
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
