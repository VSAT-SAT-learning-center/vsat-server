import {
    BadRequestException,
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { In, IsNull, Repository } from 'typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuizQuestionDto } from './dto/create-quizquestion.dto';
import { Level } from 'src/database/entities/level.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { Section } from 'src/database/entities/section.entity';
import { plainToInstance } from 'class-transformer';
import { CreateQuizAnswerDTO } from '../quizanswer/dto/create-quizanswer.dto';
import { validate } from 'class-validator';
import sanitizeHtml from 'sanitize-html';
import { QuizAnswerService } from '../quizanswer/quiz-answer.service';
import { QuizQuestionStatus } from 'src/common/enums/quiz-question.status.enum';
import { GetQuizQuestionDTO } from './dto/get-quizquestion.dto';
import { CreateQuizQuestionFileDto } from './dto/create-quizquestion-file.dto';
import { UpdateQuizQuestionDTO } from './dto/update-quizquestion.dto';
import { Answer } from 'src/database/entities/anwser.entity';
import { QuizAnswer } from 'src/database/entities/quizanswer.entity';
import { Feedback } from 'src/database/entities/feedback.entity';
import { FeedbackService } from '../feedback/feedback.service';
import { QuestionFeedbackDto } from '../feedback/dto/question-feedback.dto';
import { QuizQuestionFeedbackDto } from '../feedback/dto/quizquestion-feedback.dto';
import { AnswerHelper } from 'src/common/helpers/answer.helper';
import { populateCreatedBy } from 'src/common/utils/populateCreatedBy.util';
import { Account } from 'src/database/entities/account.entity';
import { GetQuestionDTO } from '../question/dto/get-question.dto';
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum';

@Injectable()
export class QuizQuestionService extends BaseService<QuizQuestion> {
    constructor(
        @InjectRepository(QuizQuestion)
        private readonly quizQuestionRepository: Repository<QuizQuestion>,
        @InjectRepository(Level)
        private readonly levelRepository: Repository<Level>,
        @InjectRepository(Skill)
        private readonly skillRepository: Repository<Skill>,
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
        @InjectRepository(QuizAnswer)
        private readonly quizAnswerRepository: Repository<QuizAnswer>,
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
        private readonly quizAnswerService: QuizAnswerService,
        @Inject(forwardRef(() => FeedbackService))
        private readonly feedbackService: FeedbackService,
    ) {
        super(quizQuestionRepository);
    }

    async approveOrRejectQuizQuestion(
        feedbackDto: QuizQuestionFeedbackDto,
        action: 'approve' | 'reject',
    ): Promise<Feedback> {
        if (action === 'reject') {
            return await this.rejectQuestion(feedbackDto);
        } else if (action === 'approve') {
            await this.approveQuestion(feedbackDto);
            return;
        }
    }

    async rejectQuestion(feedbackDto: QuizQuestionFeedbackDto): Promise<Feedback> {
        const { quizQuestionId } = feedbackDto;

        await this.updateStatus(quizQuestionId, QuizQuestionStatus.REJECTED);

        return await this.feedbackService.rejectQuizQuestionFeedback(feedbackDto);
    }

    async approveQuestion(feedbackDto: QuizQuestionFeedbackDto): Promise<void> {
        const { quizQuestionId } = feedbackDto;

        await this.updateStatus(quizQuestionId, QuizQuestionStatus.APPROVED);

        await this.feedbackService.approveQuizQuestionFeedback(feedbackDto);
    }

    normalizeContent(content: string): string {
        const strippedContent = sanitizeHtml(content, {
            allowedTags: [],
            allowedAttributes: {},
        });

        return strippedContent.replace(/\s+/g, ' ').trim();
    }

    async saveQuizQuestion(
        createQuizQuestionDto: CreateQuizQuestionDto,
    ): Promise<QuizQuestion> {
        const { levelId, skillId, sectionId, answers, content, plainContent } =
            createQuizQuestionDto;

        const foundLevel = await this.levelRepository.findOne({
            where: { id: levelId },
        });
        if (!foundLevel) {
            throw new NotFoundException('Level not found');
        }

        const foundSkill = await this.skillRepository.findOne({
            where: { id: skillId },
        });
        if (!foundSkill) {
            throw new NotFoundException('Skill not found');
        }

        const foundSection = await this.sectionRepository.findOne({
            where: { id: sectionId },
        });
        if (!foundSection) {
            throw new NotFoundException('Section not found');
        }

        if (!answers || answers.length === 0) {
            throw new Error('Answers array is empty');
        }

        for (const answer of answers) {
            const answerInstance = plainToInstance(CreateQuizAnswerDTO, answer);

            const validationErrors = await validate(answerInstance);
            if (validationErrors.length > 0) {
                const validationMessages = validationErrors
                    .map((err) => Object.values(err.constraints).join(', '))
                    .join('; ');
                throw new Error(validationMessages);
            }
        }

        const normalizedContent = this.normalizeContent(content);

        const existingQuestion = await this.quizQuestionRepository.findOne({
            where: { plainContent: normalizedContent },
        });

        if (existingQuestion) {
            throw new HttpException(`Question already exists`, HttpStatus.BAD_REQUEST);
        }

        if (createQuizQuestionDto.isSingleChoiceQuestion === null) {
            throw new HttpException(
                'isSingleChoiceQuestion cannot be null',
                HttpStatus.BAD_REQUEST,
            );
        }

        const newQuizQuestion = this.quizQuestionRepository.create({
            ...createQuizQuestionDto,
            level: foundLevel,
            skill: foundSkill,
            section: foundSection,
            plainContent: normalizedContent,
        });

        const savedQuizQuestion = await this.quizQuestionRepository.save(newQuizQuestion);

        await this.quizAnswerService.createMultipleQuizAnswers(
            savedQuizQuestion.id,
            answers,
        );

        return savedQuizQuestion;
    }

    async getAllWithStatus(
        page: number,
        pageSize: number,
        status: QuizQuestionStatus,
    ): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [questions, total] = await this.quizQuestionRepository.findAndCount({
            relations: ['section', 'level', 'skill', 'skill.domain', 'answers'],
            skip: skip,
            take: pageSize,
            where: { status },
            order: {
                updatedat: 'DESC',
            },
        });

        const questionsWithAccounts = await populateCreatedBy(
            questions,
            this.accountRepository,
        );

        const totalPages = Math.ceil(total / pageSize);
        return {
            data: plainToInstance(GetQuizQuestionDTO, questionsWithAccounts, {
                excludeExtraneousValues: true,
            }),
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async publish(questionIds: string[]): Promise<void> {
        const questions = await this.quizQuestionRepository.find({
            where: { id: In(questionIds) },
        });

        if (questions.length === 0) {
            throw new NotFoundException('Question is not found');
        }

        for (const question of questions) {
            question.status = QuizQuestionStatus.PENDING;
        }

        await this.quizQuestionRepository.save(questions);

        this.feedbackService.submitQuizQuestionFeedback(
            {
                status: FeedbackStatus.PENDING,
                content: 'Quiz Question submitted',
                accountFromId: questions[0].createdby,
            },
            questions,
        );
    }

    async save(createQuizQuestionDtoArray: CreateQuizQuestionFileDto[]): Promise<{
        savedQuestions: QuizQuestion[];
        errors: { question: CreateQuizQuestionFileDto; message: string }[];
    }> {
        const savedQuestions: QuizQuestion[] = [];
        const errors: {
            question: CreateQuizQuestionFileDto;
            message: string;
        }[] = [];

        for (const createQuizQuestionDto of createQuizQuestionDtoArray) {
            try {
                const { level, skill, section, answers, content } = createQuizQuestionDto;

                const foundLevel = await this.levelRepository.findOne({
                    where: { name: level },
                });
                const foundSkill = await this.skillRepository.findOne({
                    where: { content: skill },
                });
                const foundSection = await this.sectionRepository.findOne({
                    where: { name: section },
                });

                if (!answers || answers.length === 0) {
                    throw new Error('Answers array is empty');
                }

                for (const answer of answers) {
                    const answerInstance = plainToInstance(CreateQuizAnswerDTO, answer);

                    const validationErrors = await validate(answerInstance);

                    if (validationErrors.length > 0) {
                        const validationMessages = validationErrors
                            .map((err) => Object.values(err.constraints).join(', '))
                            .join('; ');
                        throw new Error(validationMessages);
                    }
                }

                const normalizedContent = this.normalizeContent(content);

                const existingQuestion = await this.quizQuestionRepository.findOne({
                    where: { plainContent: normalizedContent },
                });

                if (existingQuestion) {
                    throw new HttpException(
                        `Question already exists`,
                        HttpStatus.BAD_REQUEST,
                    );
                }

                if (!foundLevel) {
                    throw new NotFoundException('Level is not found');
                }

                if (!foundSkill) {
                    throw new NotFoundException('Skill is not found');
                }

                if (!foundSection) {
                    throw new NotFoundException('Section is not found');
                }

                if (createQuizQuestionDto.isSingleChoiceQuestion === null) {
                    throw new HttpException(
                        'IsSingleChoiceQuestion is null',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                const newQuestion = this.quizQuestionRepository.create({
                    plainContent: normalizedContent,
                    content,
                    explain: createQuizQuestionDto.explain,
                    isSingleChoiceQuestion: createQuizQuestionDto.isSingleChoiceQuestion,
                    level: foundLevel,
                    skill: foundSkill,
                    section: foundSection,
                });

                const savedQuizQuestion =
                    await this.quizQuestionRepository.save(newQuestion);

                await this.quizAnswerService.createMultipleQuizAnswers(
                    savedQuizQuestion.id,
                    answers,
                );

                savedQuestions.push(savedQuizQuestion);
            } catch (error) {
                errors.push({
                    question: createQuizQuestionDto,
                    message: error.message || 'Unknown error',
                });
            }
        }

        return {
            savedQuestions,
            errors,
        };
    }

    async updateQuizQuestion(
        id: string,
        updateQuizQuestionDto: UpdateQuizQuestionDTO,
    ): Promise<QuizQuestion> {
        const { levelId, skillId, sectionId, answers, content } = updateQuizQuestionDto;

        const foundLevel = await this.levelRepository.findOne({
            where: { id: levelId },
        });
        const foundSkill = await this.skillRepository.findOne({
            where: { id: skillId },
        });
        const foundSection = await this.sectionRepository.findOne({
            where: { id: sectionId },
        });

        const existingQuestion = await this.quizQuestionRepository.findOne({
            where: { content },
        });

        if (existingQuestion && existingQuestion.id !== id) {
            throw new HttpException(`Question is already exists !`, HttpStatus.CONFLICT);
        }

        if (!foundLevel) {
            throw new NotFoundException('Level is not found');
        }

        if (!foundSkill) {
            throw new NotFoundException('Skill is not found');
        }

        if (!foundSection) {
            throw new NotFoundException('Section is not found');
        }

        const quizQuestion = await this.quizQuestionRepository.findOne({
            where: { id },
            relations: ['answers'],
        });

        if (!quizQuestion) {
            throw new NotFoundException('Question not found');
        }

        if (quizQuestion.status === QuizQuestionStatus.APPROVED) {
            throw new HttpException(
                'Cannot update question because it is already Approved',
                HttpStatus.BAD_REQUEST,
            );
        } else if (quizQuestion.status === QuizQuestionStatus.PENDING) {
            throw new HttpException(
                'Cannot update question because it is already Pending',
                HttpStatus.BAD_REQUEST,
            );
        } else if (quizQuestion.status === QuizQuestionStatus.REJECTED) {
            quizQuestion.status = QuizQuestionStatus.DRAFT;
        }

        Object.assign(quizQuestion, {
            ...updateQuizQuestionDto,
            level: foundLevel,
            skill: foundSkill,
            section: foundSection,
            status: quizQuestion.status,
        });

        for (const answerDto of answers) {
            if (!answerDto.id) {
                const newAnswer = this.quizAnswerRepository.create({
                    ...answerDto,
                    quizquestion: quizQuestion,
                });
                await this.quizAnswerRepository.save(newAnswer);
            } else {
                const existingAnswer = quizQuestion.answers.find(
                    (answer) => answer.id === answerDto.id,
                );

                if (existingAnswer) {
                    Object.assign(existingAnswer, answerDto);
                    await this.quizAnswerRepository.save(existingAnswer);
                } else {
                    const newAnswer = this.quizAnswerRepository.create({
                        ...answerDto,
                        quizquestion: quizQuestion,
                    });
                    await this.quizAnswerRepository.save(newAnswer);
                }
            }
        }

        const updatedQuestion = await this.quizQuestionRepository.save(quizQuestion);

        const answersToDelete = await this.quizAnswerRepository.find({
            where: { quizquestion: IsNull() },
        });

        if (answersToDelete.length > 0) {
            for (const answer of answersToDelete) {
                await this.quizAnswerRepository.remove(answer);
            }
        }

        const questionWithAnswers = await this.quizQuestionRepository.findOne({
            where: { id: updatedQuestion.id },
            relations: ['answers'],
        });

        return questionWithAnswers;
    }

    async updateStatus(id: string, status: QuizQuestionStatus): Promise<boolean> {
        const quizQuestion = await this.quizQuestionRepository.findOneBy({
            id,
        });
        if (!quizQuestion) {
            throw new NotFoundException('Question not found');
        }

        if (status === QuizQuestionStatus.REJECTED) {
            if (quizQuestion.countfeedback == 3) {
                quizQuestion.isActive = false;
            }
            quizQuestion.countfeedback = quizQuestion.countfeedback + 1;
        }

        quizQuestion.status = status;

        await this.quizQuestionRepository.save(quizQuestion);
        return true;
    }

    async getQuizQuestionsByLevelAndSkill(
        levelId: string,
        skillId: string,
    ): Promise<any[]> {
        const quizQuestions = await this.quizQuestionRepository.find({
            where: {
                level: { id: levelId },
                skill: { id: skillId },
                status: QuizQuestionStatus.APPROVED,
            },
            relations: ['answers'],
        });

        const questionsWithAccounts = await populateCreatedBy(
            quizQuestions,
            this.accountRepository,
        );

        return plainToInstance(GetQuizQuestionDTO, questionsWithAccounts, {
            excludeExtraneousValues: true,
        });
    }

    async getRandomQuizQuestionsByLevelAndSkill(
        levelId: string,
        skillId: string,
        quantity: number,
    ): Promise<QuizQuestion[]> {
        // Fetch all matching quiz questions
        const questions = await this.quizQuestionRepository.find({
            where: {
                level: { id: levelId },
                skill: { id: skillId },
                status: QuizQuestionStatus.APPROVED, // Filter by approved status if needed
            },
            relations: ['answers'], // Optionally include related answers
        });

        // Shuffle questions and select a specified quantity
        return this.getRandomSubset(questions, quantity);
    }

    private getRandomSubset(questions: QuizQuestion[], quantity: number): QuizQuestion[] {
        // Shuffle the questions array
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }

        // Return the first `quantity` items after shuffle
        return questions.slice(0, quantity);
    }

    async verifyAnswer(
        questionId: string,
        selectedAnswerId: string,
        studentAnswerText: string,
    ): Promise<boolean> {
        const question = await this.quizQuestionRepository.findOne({
            where: { id: questionId },
            relations: ['answers'],
        });

        if (!question) {
            throw new NotFoundException(`Question with ID ${questionId} not found`);
        }

        const correctAnswer = question.answers.find((answer) => answer.isCorrectAnswer);
        if (studentAnswerText) {
            const normalizedAnswerText = AnswerHelper.normalize(selectedAnswerId);
            return correctAnswer.plaintext === normalizedAnswerText;
        } else {
            return correctAnswer?.id === selectedAnswerId;
        }
    }
}
