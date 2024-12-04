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
import { Between, ILike, In, IsNull, Like, Repository } from 'typeorm';
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
import { FetchByContentDTO } from './dto/fetch-question.dto';
import { Account } from 'src/database/entities/account.entity';
import { populateCreatedBy } from 'src/common/utils/populateCreatedBy.util';
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum';
import { BaseService } from '../base/base.service';
import { Quiz } from 'src/database/entities/quiz.entity';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { QuizQuestionStatus } from 'src/common/enums/quiz-question.status.enum';
import { Exam } from 'src/database/entities/exam.entity';
import { ExamStatus } from 'src/common/enums/exam-status.enum';
import { Unit } from 'src/database/entities/unit.entity';
import { UnitStatus } from 'src/common/enums/unit-status.enum';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { StudyProfileStatus } from 'src/common/enums/study-profile-status.enum';
import { Domain } from 'src/database/entities/domain.entity';

@Injectable()
export class QuestionService extends BaseService<Question> {
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
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
        @InjectRepository(QuizQuestion)
        private readonly quizQuestionRepository: Repository<QuizQuestion>,
        @InjectRepository(Exam)
        private readonly examRepository: Repository<Exam>,
        @InjectRepository(StudyProfile)
        private readonly studyProfileRepository: Repository<StudyProfile>,
        @InjectRepository(Unit)
        private readonly unitRepository: Repository<Unit>,
        @InjectRepository(Domain)
        private readonly domainRepository: Repository<Domain>,
        private readonly answerService: Answerservice,

        @Inject(forwardRef(() => FeedbackService))
        private readonly feedbackService: FeedbackService,
    ) {
        super(questionRepository);
    }

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

        return strippedContent
            .replace(/\s+/g, ' ')
            .replace(/\s+([.,!?])/g, '$1')
            .trim();
    }

    async rejectQuestion(feedbackDto: QuestionFeedbackDto): Promise<Feedback> {
        const { questionId } = feedbackDto;

        await this.updateStatus(questionId, QuestionStatus.REJECTED);

        return await this.feedbackService.rejectQuestionFeedback(feedbackDto);
    }

    async approveQuestion(feedbackDto: QuestionFeedbackDto): Promise<void> {
        const { questionId } = feedbackDto;

        await this.updateStatus(questionId, QuestionStatus.APPROVED);

        this.feedbackService.approveQuestionFeedback(feedbackDto);
    }

    async save(createQuestionDtoArray: CreateQuestionFileDto[]): Promise<{
        savedQuestions: Question[];
        errors: { question: CreateQuestionFileDto; message: string }[];
    }> {
        const savedQuestions: Question[] = [];
        const errors: { question: CreateQuestionFileDto; message: string }[] = [];

        for (const createQuestionDto of createQuestionDtoArray) {
            try {
                const { level, skill, section, answers, content, plainContent } =
                    createQuestionDto;

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

                const savedQuestion = await this.questionRepository.save(newQuestion);

                await this.answerService.createMultipleAnswers(savedQuestion.id, answers);

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
        const normalizedAnswers = new Set();
        for (const answer of answers) {
            const answerInstance = plainToInstance(CreateAnswerDTO, answer);

            const validationErrors = await validate(answerInstance);

            if (validationErrors.length > 0) {
                const validationMessages = validationErrors
                    .map((err) => Object.values(err.constraints).join(', '))
                    .join('; ');
                throw new Error(validationMessages);
            }

            const normalizedText = this.normalizeContent(answer.text);
            if (normalizedAnswers.has(normalizedText)) {
                throw new HttpException(
                    `Duplicate answer: ${answer.text}`,
                    HttpStatus.BAD_REQUEST,
                );
            }
            normalizedAnswers.add(normalizedText);
        }

        const normalizedContent = this.normalizeContent(content);

        const existingQuestion = await this.questionRepository.findOne({
            where: { plainContent: normalizedContent },
        });

        if (existingQuestion) {
            throw new HttpException(`Question already exists`, HttpStatus.BAD_REQUEST);
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

        await this.answerService.createMultipleAnswers(savedQuestion.id, answers);

        return savedQuestion;
    }

    async saveExamQuestion(createQuestionDtoArray: CreateQuestionExamDto[]): Promise<{
        savedQuestions: Question[];
        errors: { question: CreateQuestionExamDto; message: string }[];
    }> {
        const savedQuestions: Question[] = [];
        const errors: { question: CreateQuestionExamDto; message: string }[] = [];

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

                const savedQuestion = await this.questionRepository.save(newQuestion);

                await this.answerService.createMultipleAnswers(savedQuestion.id, answers);

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
            order: { updatedat: 'DESC' },
        });

        const questionsWithAccounts = await populateCreatedBy(
            questions,
            this.accountRepository,
        );
        const totalPages = Math.ceil(total / pageSize);

        return {
            data: plainToInstance(GetQuestionDTO, questionsWithAccounts, {
                excludeExtraneousValues: true,
            }),
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async getAllWithStatusByCreateBy(
        page: number,
        pageSize: number,
        status: QuestionStatus,
        accountId: string,
    ): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [questions, total] = await this.questionRepository.findAndCount({
            relations: ['section', 'level', 'skill', 'skill.domain', 'answers'],
            skip: skip,
            take: pageSize,
            where: { status: status, createdby: accountId },
            order: { updatedat: 'DESC' },
        });

        const questionsWithAccounts = await populateCreatedBy(
            questions,
            this.accountRepository,
        );
        const totalPages = Math.ceil(total / pageSize);

        return {
            data: plainToInstance(GetQuestionDTO, questionsWithAccounts, {
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

        if (status === QuestionStatus.REJECTED) {
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
        const { levelId, skillId, sectionId, answers, content } = updateQuestionDto;

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
        } else if (question.status === QuestionStatus.REJECTED) {
            question.status = QuestionStatus.DRAFT;
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
            relations: ['answers', 'level', 'skill', 'section'],
            skip: skip,
            take: pageSize,
        });

        const totalPages = Math.ceil(total / pageSize);

        const questionsWithAccounts = await populateCreatedBy(
            questions,
            this.accountRepository,
        );
        return {
            data: plainToInstance(GetQuestionWithAnswerDTO, questionsWithAccounts, {
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

        this.feedbackService.submitQuestionFeedback(
            {
                status: FeedbackStatus.PENDING,
                content: 'Question submitted',
                accountFromId: questions[0].createdby,
            },
            questions,
        );
    }

    async searchQuestions(
        page: number,
        pageSize: number,
        skillId?: string,
        domain?: string,
        level?: string,
        plainContent?: string,
    ): Promise<any> {
        const skip = (page - 1) * pageSize;
        const status = QuestionStatus.APPROVED;
        const whereCondition: any = { status };

        if (skillId) {
            whereCondition.skill = { id: skillId };
        }

        if (domain) {
            whereCondition.skill = {
                ...whereCondition.skill,
                domain: { content: domain },
            };
        }

        if (plainContent) {
            whereCondition.plainContent = ILike(`%${plainContent}%`);
        }

        if (level) {
            whereCondition.level = { name: level };
        }

        const [questions, total] = await this.questionRepository.findAndCount({
            relations: ['section', 'level', 'skill', 'skill.domain', 'answers'],
            skip: skip,
            take: pageSize,
            where: whereCondition,
            order: { updatedat: 'DESC' },
        });

        const totalPages = Math.ceil(total / pageSize);

        const questionsWithAccounts = await populateCreatedBy(
            questions,
            this.accountRepository,
        );

        return {
            data: plainToInstance(GetQuestionDTO, questionsWithAccounts, {
                excludeExtraneousValues: true,
            }),
            totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async searchQuestionsByCreateBy(
        page: number,
        pageSize: number,
        skillId?: string,
        domainId?: string,
        levelId?: string,
        sectionId?: string,
        status?: QuestionStatus,
        accountId?: string,
    ): Promise<any> {
        const skip = (page - 1) * pageSize;

        const whereCondition: any = { status };

        if (skillId) {
            whereCondition.skill = { id: skillId };
        }

        if (domainId) {
            whereCondition.skill = {
                ...whereCondition.skill,
                domain: { id: domainId },
            };
        }

        if (levelId) {
            whereCondition.level = { id: levelId };
        }

        if (sectionId) {
            whereCondition.section = { id: sectionId };
        }

        if (accountId) {
            whereCondition.createdby = accountId;
        }

        const [questions, total] = await this.questionRepository.findAndCount({
            relations: ['section', 'level', 'skill', 'skill.domain', 'answers'],
            skip: skip,
            take: pageSize,
            where: whereCondition,
            order: { updatedat: 'DESC' },
        });

        const questionsWithAccounts = await populateCreatedBy(
            questions,
            this.accountRepository,
        );

        const totalPages = Math.ceil(total / pageSize);

        return {
            data: plainToInstance(GetQuestionDTO, questionsWithAccounts, {
                excludeExtraneousValues: true,
            }),
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async fetchByContent(contents: string[]): Promise<GetQuestionDTO[]> {
        const questions = [];

        for (const content of contents) {
            const question = await this.questionRepository.findOne({
                where: { plainContent: content },
                relations: ['section', 'level', 'skill', 'skill.domain', 'answers'],
            });

            if (!question) {
                throw new NotFoundException(`Question is not found`);
            }

            questions.push(question);
        }

        const questionsWithAccounts = await populateCreatedBy(
            questions,
            this.accountRepository,
        );

        return plainToInstance(GetQuestionDTO, questionsWithAccounts, {
            excludeExtraneousValues: true,
        });
    }

    async statisticForStaff(accountId: string): Promise<any> {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Count questions by status
        const approvedQuestionCount = await this.questionRepository.count({
            where: {
                createdby: accountId,
                status: QuestionStatus.APPROVED,
            },
        });

        const rejectedQuestionCount = await this.questionRepository.count({
            where: {
                createdby: accountId,
                status: QuestionStatus.REJECTED,
            },
        });

        const pendingQuestionCount = await this.questionRepository.count({
            where: {
                createdby: accountId,
                status: QuestionStatus.PENDING,
            },
        });

        // Count quizzes by status
        const approvedQuizCount = await this.quizQuestionRepository.count({
            where: {
                createdby: accountId,
                status: QuizQuestionStatus.APPROVED,
            },
        });

        const rejectedQuizCount = await this.quizQuestionRepository.count({
            where: {
                createdby: accountId,
                status: QuizQuestionStatus.REJECTED,
            },
        });

        const pendingQuizCount = await this.quizQuestionRepository.count({
            where: {
                createdby: accountId,
                status: QuizQuestionStatus.PENDING,
            },
        });

        // Count exam by status
        const approvedExamCount = await this.examRepository.count({
            where: {
                createdby: accountId,
                status: ExamStatus.APPROVED,
            },
        });

        const rejectedExamCount = await this.examRepository.count({
            where: {
                createdby: accountId,
                status: ExamStatus.REJECTED,
            },
        });

        const pendingExamCount = await this.examRepository.count({
            where: {
                createdby: accountId,
                status: ExamStatus.PENDING,
            },
        });

        const createOfMonthExamCount = await this.examRepository.count({
            where: {
                createdby: accountId,
                createdat: Between(startOfMonth, endOfMonth),
            },
        });

        // const rejectedOfMonthExamCount = await this.examRepository.count({
        //     where: {
        //         createdby: accountId,
        //         status: ExamStatus.REJECTED,
        //         createdat: Between(startOfMonth, endOfMonth),
        //     },
        // });

        // const pendingOfMonthExamCount = await this.examRepository.count({
        //     where: {
        //         createdby: accountId,
        //         status: ExamStatus.PENDING,
        //         createdat: Between(startOfMonth, endOfMonth),
        //     },
        // });

        // Count unit by status
        const approvedUnitCount = await this.unitRepository.count({
            where: {
                createdby: accountId,
                status: UnitStatus.APPROVED,
            },
        });

        const rejectedUnitCount = await this.unitRepository.count({
            where: {
                createdby: accountId,
                status: UnitStatus.REJECTED,
            },
        });

        const pendingUnitCount = await this.unitRepository.count({
            where: {
                createdby: accountId,
                status: UnitStatus.PENDING,
            },
        });

        const inactiveStudy = await this.studyProfileRepository.count({
            where: {
                status: StudyProfileStatus.INACTIVE,
            },
        });

        const activeStudy = await this.studyProfileRepository.count({
            where: {
                status: StudyProfileStatus.ACTIVE,
            },
        });

        const completeStudy = await this.studyProfileRepository.count({
            where: {
                status: StudyProfileStatus.COMPLETED,
            },
        });

        const createOfMonthStudy = await this.studyProfileRepository.count({
            where: {
                createdat: Between(startOfMonth, endOfMonth),
            },
        });

        // const activeOfMonthStudy = await this.studyProfileRepository.count({
        //     where: {
        //         status: StudyProfileStatus.ACTIVE,
        //         createdat: Between(startOfMonth, endOfMonth),
        //     },
        // });

        // const completeOfMonthStudy = await this.studyProfileRepository.count({
        //     where: {
        //         status: StudyProfileStatus.COMPLETED,
        //         createdat: Between(startOfMonth, endOfMonth),
        //     },
        // });

        const domains = await this.domainRepository.find({
            select: ['content'],
        });

        const domainStatistics = await Promise.all(
            domains.map(async (domain) => {
                const approvedCount = await this.questionRepository.count({
                    where: {
                        skill: { domain: { content: domain.content } },
                        status: QuestionStatus.APPROVED,
                        createdby: accountId,
                    },
                    relations: ['skill', 'skill.domain'],
                });

                const pendingCount = await this.questionRepository.count({
                    where: {
                        skill: { domain: { content: domain.content } },
                        status: QuestionStatus.PENDING,
                        createdby: accountId,
                    },
                    relations: ['skill', 'skill.domain'],
                });

                const rejectedCount = await this.questionRepository.count({
                    where: {
                        skill: { domain: { content: domain.content } },
                        status: QuestionStatus.REJECTED,
                        createdby: accountId,
                    },
                    relations: ['skill', 'skill.domain'],
                });

                return {
                    domain,
                    approved: approvedCount,
                    pending: pendingCount,
                    rejected: rejectedCount,
                };
            }),
        );

        const domainQuizStatistics = await Promise.all(
            domains.map(async (domain) => {
                const approvedCount = await this.quizQuestionRepository.count({
                    where: {
                        skill: { domain: { content: domain.content } },
                        status: QuizQuestionStatus.APPROVED,
                        createdby: accountId,
                    },
                    relations: ['skill', 'skill.domain'],
                });

                const pendingCount = await this.quizQuestionRepository.count({
                    where: {
                        skill: { domain: { content: domain.content } },
                        status: QuizQuestionStatus.PENDING,
                        createdby: accountId,
                    },
                    relations: ['skill', 'skill.domain'],
                });

                const rejectedCount = await this.quizQuestionRepository.count({
                    where: {
                        skill: { domain: { content: domain.content } },
                        status: QuizQuestionStatus.REJECTED,
                        createdby: accountId,
                    },
                    relations: ['skill', 'skill.domain'],
                });

                return {
                    domain,
                    approved: approvedCount,
                    pending: pendingCount,
                    rejected: rejectedCount,
                };
            }),
        );

        return {
            questions: {
                approved: approvedQuestionCount,
                rejected: rejectedQuestionCount,
                pending: pendingQuestionCount,
            },
            quizquestion: {
                approved: approvedQuizCount,
                rejected: rejectedQuizCount,
                pending: pendingQuizCount,
            },
            exam: {
                approved: approvedExamCount,
                rejected: rejectedExamCount,
                pending: pendingExamCount,
                createofmonth: createOfMonthExamCount
            },
            unit: {
                approved: approvedUnitCount,
                rejected: rejectedUnitCount,
                pending: pendingUnitCount,
            },
            studyprofile: {
                inactive: inactiveStudy,
                active: activeStudy,
                complete: completeStudy,
                createofmonth: createOfMonthStudy
            },
            domainsquestion: domainStatistics,
            domainsquiz: domainQuizStatistics,
        };
    }

    async statisticForManager(): Promise<any> {
        // Count questions by status
        const approvedQuestionCount = await this.questionRepository.count({
            where: {
                status: QuestionStatus.APPROVED,
            },
        });

        const rejectedQuestionCount = await this.questionRepository.count({
            where: {
                status: QuestionStatus.REJECTED,
            },
        });

        // Count quizzes by status
        const approvedQuizCount = await this.quizQuestionRepository.count({
            where: {
                status: QuizQuestionStatus.APPROVED,
            },
        });

        const rejectedQuizCount = await this.quizQuestionRepository.count({
            where: {
                status: QuizQuestionStatus.REJECTED,
            },
        });

        // Count exam by status
        const approvedExamCount = await this.examRepository.count({
            where: {
                status: ExamStatus.APPROVED,
            },
        });

        const rejectedExamCount = await this.examRepository.count({
            where: {
                status: ExamStatus.REJECTED,
            },
        });

        // Count unit by status
        const approvedUnitCount = await this.unitRepository.count({
            where: {
                status: UnitStatus.APPROVED,
            },
        });

        const rejectedUnitCount = await this.unitRepository.count({
            where: {
                status: UnitStatus.REJECTED,
            },
        });

        return {
            questions: {
                approved: approvedQuestionCount,
                rejected: rejectedQuestionCount,
            },
            quizquestion: {
                approved: approvedQuizCount,
                rejected: rejectedQuizCount,
            },
            exam: {
                approved: approvedExamCount,
                rejected: rejectedExamCount,
            },
            unit: {
                approved: approvedUnitCount,
                rejected: rejectedUnitCount,
            },
        };
    }

    async statisticScores(): Promise<any> {
        const MAX_SCORE = 800;
        const students = await this.accountRepository.find({
            where: { role: { rolename: 'Student' } },
            relations: [
                'studyProfiles',
                'studyProfiles.targetlearning',
                'studyProfiles.targetlearning.examattempt',
            ],
        });

        let totalScoreMath = 0;
        let totalScoreRW = 0;
        let totalAttempts = 0;

        students.forEach((student) => {
            student.studyProfiles?.forEach((profile) => {
                profile.targetlearning?.forEach((targetLearning) => {
                    const examAttempt = targetLearning?.examattempt;
                    if (examAttempt) {
                        totalScoreMath += examAttempt.scoreMath || 0;
                        totalScoreRW += examAttempt.scoreRW || 0;
                        totalAttempts += 1;
                    }
                });
            });
        });

        const totalMaxScoreMath = totalAttempts * MAX_SCORE;
        const totalMaxScoreRW = totalAttempts * MAX_SCORE;

        const averageScoreMath = totalAttempts > 0 ? totalScoreMath / totalAttempts : 0;
        const averageScoreRW = totalAttempts > 0 ? totalScoreRW / totalAttempts : 0;

        const percentageMath =
            totalMaxScoreMath > 0 ? (totalScoreMath / totalMaxScoreMath) * 100 : 0;
        const percentageRW =
            totalMaxScoreRW > 0 ? (totalScoreRW / totalMaxScoreRW) * 100 : 0;

        return {
            totalAttempts,
            averageScoreMath,
            averageScoreRW,
            percentageMath,
            percentageRW,
        };
    }

    async statisticScoresByTeacher(teacherId: string): Promise<any> {
        const MAX_SCORE = 800;
        const accounts = await this.accountRepository.find({
            where: {
                role: { rolename: 'Student' },
                studyProfiles: { teacherId: teacherId },
            },
            relations: [
                'studyProfiles',
                'studyProfiles.targetlearning',
                'studyProfiles.targetlearning.examattempt',
            ],
        });

        let totalScoreMath = 0;
        let totalScoreRW = 0;
        let totalAttempts = 0;

        accounts.forEach((student) => {
            student.studyProfiles?.forEach((profile) => {
                profile.targetlearning?.forEach((targetLearning) => {
                    const examAttempt = targetLearning?.examattempt;
                    if (examAttempt) {
                        totalScoreMath += examAttempt.scoreMath || 0;
                        totalScoreRW += examAttempt.scoreRW || 0;
                        totalAttempts += 1;
                    }
                });
            });
        });

        const totalMaxScoreMath = totalAttempts * MAX_SCORE;
        const totalMaxScoreRW = totalAttempts * MAX_SCORE;

        const averageScoreMath = totalAttempts > 0 ? totalScoreMath / totalAttempts : 0;
        const averageScoreRW = totalAttempts > 0 ? totalScoreRW / totalAttempts : 0;

        const percentageMath =
            totalMaxScoreMath > 0 ? (totalScoreMath / totalMaxScoreMath) * 100 : 0;
        const percentageRW =
            totalMaxScoreRW > 0 ? (totalScoreRW / totalMaxScoreRW) * 100 : 0;

        return {
            totalAttempts,
            averageScoreMath,
            averageScoreRW,
            percentageMath,
            percentageRW,
        };
    }
}
