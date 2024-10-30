import {
    BadRequestException,
    ConflictException,
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/database/entities/question.entity';
import { In, IsNull, Repository } from 'typeorm';
import { CreateQuestionDTO } from './dto/create-question.dto';
import { plainToInstance } from 'class-transformer';
import { Level } from 'src/database/entities/level.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { GetQuestionDTO } from './dto/get-question.dto';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { UpdateQuestionDTO } from './dto/update-question.dto';
import { GetQuestionWithAnswerDTO } from './dto/get-with-answer-question.dto';
import { Answerservice } from '../answer/answer.service';
import { Section } from 'src/database/entities/section.entity';
import { CreateQuestionFileDto } from './dto/create-question-file.dto';
import { Answer } from 'src/database/entities/anwser.entity';
import { QuestionFeedbackDto } from '../feedback/dto/question-feedback.dto';
import { FeedbackService } from '../feedback/feedback.service';
import { Feedback } from 'src/database/entities/feedback.entity';
import { CreateQuestionExamDto } from './dto/create-question-exam.dto';
import sanitizeHtml from 'sanitize-html';
import { validate } from 'class-validator';
import { CreateAnswerDTO } from '../answer/dto/create-answer.dto';

@Injectable()
export class QuestionService {
    constructor(
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(Level)
        private readonly levelRepository: Repository<Level>,
        @InjectRepository(Skill)
        private readonly skillRepository: Repository<Skill>,
        @InjectRepository(Answer)
        private readonly answerRepository: Repository<Answer>,
        private readonly answerService: Answerservice,

        @Inject(forwardRef(() => FeedbackService))
        private readonly feedbackService: FeedbackService,
    ) {}

    async approveOrRejectQuestion(
        feedbackDto: QuestionFeedbackDto,
        action: 'approve' | 'reject',
    ): Promise<Feedback> {
        if (action === 'reject') {
            return await this.rejectQuestion(feedbackDto);
        } else if (action === 'approve') {
            await this.approveQuestion(feedbackDto);
            return;
        }
    }

    normalizeContent(content: string): string {
        const strippedContent = sanitizeHtml(content, {
            allowedTags: [],
            allowedAttributes: {},
        });

        return strippedContent.replace(/\s+/g, ' ').trim();
    }

    async rejectQuestion(feedbackDto: QuestionFeedbackDto): Promise<Feedback> {
        const { questionId } = feedbackDto;

        await this.updateStatus(questionId, QuestionStatus.REJECT);

        return await this.feedbackService.rejectQuestionFeedback(feedbackDto);
    }

    async approveQuestion(feedbackDto: QuestionFeedbackDto): Promise<void> {
        const { questionId } = feedbackDto;

        await this.updateStatus(questionId, QuestionStatus.APPROVED);

        //this.feedbackService.approveQuestionFeedback(feedbackDto);
    }

    async save(createQuestionDtoArray: CreateQuestionFileDto[]): Promise<{
        savedQuestions: Question[];
        errors: { question: CreateQuestionFileDto; message: string }[];
    }> {
        const savedQuestions: Question[] = [];
        const errors: { question: CreateQuestionFileDto; message: string }[] =
            [];

        for (const createQuestionDto of createQuestionDtoArray) {
            try {
                const {
                    level,
                    skill,
                    section,
                    answers,
                    content,
                    plainContent,
                } = createQuestionDto;

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
                    const answerInstance = plainToInstance(
                        CreateAnswerDTO,
                        answer,
                    );

                    const validationErrors = await validate(answerInstance);

                    if (validationErrors.length > 0) {
                        const validationMessages = validationErrors
                            .map((err) =>
                                Object.values(err.constraints).join(', '),
                            )
                            .join('; ');
                        throw new Error(validationMessages);
                    }
                }

                const normalizedContent = this.normalizeContent(content);

                const existingQuestion = await this.questionRepository.findOne({
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

                if (createQuestionDto.isSingleChoiceQuestion === null) {
                    throw new HttpException(
                        'IsSingleChoiceQuestion is null',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                const newQuestion = this.questionRepository.create({
                    ...createQuestionDto,
                    level: foundLevel,
                    skill: foundSkill,
                    section: foundSection,
                    plainContent: normalizedContent,
                });

                const savedQuestion =
                    await this.questionRepository.save(newQuestion);

                await this.answerService.createMultipleAnswers(
                    savedQuestion.id,
                    answers,
                );

                savedQuestions.push(savedQuestion);
            } catch (error) {
                errors.push({
                    question: createQuestionDto,
                    message: error.message || 'Unknown error',
                });
            }
        }

        return {
            savedQuestions,
            errors,
        };
    }

    async saveManual(createQuestionDto: CreateQuestionDTO): Promise<Question> {
        const { levelId, skillId, sectionId, answers, content, plainContent } =
            createQuestionDto;

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
            const answerInstance = plainToInstance(CreateAnswerDTO, answer);

            const validationErrors = await validate(answerInstance);

            if (validationErrors.length > 0) {
                const validationMessages = validationErrors
                    .map((err) => Object.values(err.constraints).join(', '))
                    .join('; ');
                throw new Error(validationMessages);
            }
        }

        const normalizedContent = this.normalizeContent(content);

        const existingQuestion = await this.questionRepository.findOne({
            where: { plainContent: normalizedContent },
        });

        if (existingQuestion) {
            throw new HttpException(
                `Question already exists`,
                HttpStatus.BAD_REQUEST,
            );
        }

        if (createQuestionDto.isSingleChoiceQuestion === null) {
            throw new HttpException(
                'isSingleChoiceQuestion cannot be null',
                HttpStatus.BAD_REQUEST,
            );
        }

        const newQuestion = this.questionRepository.create({
            ...createQuestionDto,
            level: foundLevel,
            skill: foundSkill,
            section: foundSection,
            plainContent: normalizedContent,
        });

        const savedQuestion = await this.questionRepository.save(newQuestion);

        await this.answerService.createMultipleAnswers(
            savedQuestion.id,
            answers,
        );

        return savedQuestion;
    }

    async saveExamQuestion(
        createQuestionDtoArray: CreateQuestionExamDto[],
    ): Promise<{
        savedQuestions: Question[];
        errors: { question: CreateQuestionExamDto; message: string }[];
    }> {
        const savedQuestions: Question[] = [];
        const errors: { question: CreateQuestionExamDto; message: string }[] =
            [];

        for (const createQuestionDto of createQuestionDtoArray) {
            try {
                const { levelId, skillId, sectionId, answers, content } =
                    createQuestionDto;

                const foundLevel = await this.levelRepository.findOne({
                    where: { id: levelId },
                });
                const foundSkill = await this.skillRepository.findOne({
                    where: { id: skillId },
                });
                const foundSection = await this.sectionRepository.findOne({
                    where: { id: sectionId },
                });

                const existingQuestion = await this.questionRepository.findOne({
                    where: { content },
                });

                if (existingQuestion) {
                    throw new HttpException(
                        `Content ${content} is already exsist`,
                        HttpStatus.CONFLICT,
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

                if (!createQuestionDto.isSingleChoiceQuestion === null) {
                    throw new HttpException(
                        'IsSingleChoiceQuestion is null',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                const newQuestion = this.questionRepository.create({
                    ...createQuestionDto,
                    level: foundLevel,
                    skill: foundSkill,
                    section: foundSection,
                });

                const savedQuestion =
                    await this.questionRepository.save(newQuestion);

                await this.answerService.createMultipleAnswers(
                    savedQuestion.id,
                    answers,
                );

                savedQuestions.push(savedQuestion);
            } catch (error) {
                errors.push({
                    question: createQuestionDto,
                    message: error.message || 'Unknown error',
                });
            }
        }

        return {
            savedQuestions,
            errors,
        };
    }

    async getAllWithStatus(
        page: number,
        pageSize: number,
        status: QuestionStatus,
    ): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [questions, total] = await this.questionRepository.findAndCount({
            relations: ['section', 'level', 'skill', 'skill.domain', 'answers'],
            skip: skip,
            take: pageSize,
            where: { status },
            order: {
                updatedat: 'DESC',
            },
        });

        const totalPages = Math.ceil(total / pageSize);
        return {
            data: plainToInstance(GetQuestionDTO, questions, {
                excludeExtraneousValues: true,
            }),
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async updateStatus(id: string, status: QuestionStatus): Promise<boolean> {
        if (!Object.values(QuestionStatus).includes(status)) {
            throw new BadRequestException(`Invalid status value: ${status}`);
        }

        const question = await this.questionRepository.findOneBy({ id });
        if (!question) {
            throw new NotFoundException('Question not found');
        }

        if (status === QuestionStatus.REJECT) {
            if (question.countfeedback == 3) {
                question.isActive = false;
            }
            question.countfeedback = question.countfeedback + 1;
        }

        question.status = status;

        await this.questionRepository.save(question);
        return true;
    }

    async updateQuestion(
        id: string,
        updateQuestionDto: UpdateQuestionDTO,
    ): Promise<Question> {
        const { levelId, skillId, sectionId, answers, content } =
            updateQuestionDto;

        const foundLevel = await this.levelRepository.findOne({
            where: { id: levelId },
        });
        const foundSkill = await this.skillRepository.findOne({
            where: { id: skillId },
        });
        const foundSection = await this.sectionRepository.findOne({
            where: { id: sectionId },
        });

        const existingQuestion = await this.questionRepository.findOne({
            where: { content },
        });

        if (existingQuestion && existingQuestion.id !== id) {
            throw new HttpException(
                `Question is already exists !`,
                HttpStatus.CONFLICT,
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

        const question = await this.questionRepository.findOne({
            where: { id },
            relations: ['answers'],
        });

        if (!question) {
            throw new NotFoundException('Question not found');
        }

       

        if (question.status === QuestionStatus.APPROVED) {
            throw new HttpException(
                'Cannot update question because it is already Approved',
                HttpStatus.BAD_REQUEST,
            );
        } else if (question.status === QuestionStatus.PENDING) {
            throw new HttpException(
                'Cannot update question because it is already Pending',
                HttpStatus.BAD_REQUEST,
            );
        }else if (question.status === QuestionStatus.REJECT) {
            question.status = QuestionStatus.PENDING;
        }

        Object.assign(question, {
            ...updateQuestionDto,
            level: foundLevel,
            skill: foundSkill,
            section: foundSection,
            status: question.status,
        });

        for (const answerDto of answers) {
            if (!answerDto.id) {
                const newAnswer = this.answerRepository.create({
                    ...answerDto,
                    question,
                });
                await this.answerRepository.save(newAnswer);
            } else {
                const existingAnswer = question.answers.find(
                    (answer) => answer.id === answerDto.id,
                );

                if (existingAnswer) {
                    Object.assign(existingAnswer, answerDto);
                    await this.answerRepository.save(existingAnswer);
                } else {
                    const newAnswer = this.answerRepository.create({
                        ...answerDto,
                        question,
                    });
                    await this.answerRepository.save(newAnswer);
                }
            }
        }

        const updatedQuestion = await this.questionRepository.save(question);

        const answersToDelete = await this.answerRepository.find({
            where: { question: IsNull() },
        });

        if (answersToDelete.length > 0) {
            for (const answer of answersToDelete) {
                await this.answerRepository.remove(answer);
            }
        }

        const questionWithAnswers = await this.questionRepository.findOne({
            where: { id: updatedQuestion.id },
            relations: ['answers'],
        });

        return questionWithAnswers;
    }

    async getQuestionWithAnswer(page: number, pageSize: number): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [questions, total] = await this.questionRepository.findAndCount({
            relations: ['answers'],
            skip: skip,
            take: pageSize,
        });

        const totalPages = Math.ceil(total / pageSize);

        return {
            data: plainToInstance(GetQuestionWithAnswerDTO, questions, {
                excludeExtraneousValues: true,
            }),
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async publish(questionIds: string[]): Promise<void> {
        const questions = await this.questionRepository.find({
            where: { id: In(questionIds) },
        });

        if (questions.length === 0) {
            throw new NotFoundException('Question is not found');
        }

        for (const question of questions) {
            question.status = QuestionStatus.PENDING;
        }

        await this.questionRepository.save(questions);
    }
}
