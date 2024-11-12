import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamStatus } from 'src/common/enums/exam-status.enum';
import { Domain } from 'src/database/entities/domain.entity';
import { Exam } from 'src/database/entities/exam.entity';
import { ExamQuestion } from 'src/database/entities/examquestion.entity';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { Question } from 'src/database/entities/question.entity';
import { Repository } from 'typeorm';
import { CreateExamQuestionDTO } from './dto/create-examquestion.dto';
import { UpdateExamQuestion } from './dto/update-examquestion.dto';

@Injectable()
export class ExamQuestionService {
    constructor(
        @InjectRepository(ExamQuestion)
        private readonly examQuestionRepository: Repository<ExamQuestion>,
        @InjectRepository(ModuleType)
        private readonly moduleTypeRepository: Repository<ModuleType>,
        @InjectRepository(Exam)
        private readonly examRepository: Repository<Exam>,
        @InjectRepository(Domain)
        private readonly domainRepository: Repository<Domain>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
    ) {}

    // async createExamQuestion(
    //     createExamQuestionDto: CreateExamQuestionDTO,
    // ): Promise<ExamQuestion[]> {
    //     const { exam, question, moduleTypeId } = createExamQuestionDto;

    //     const moduleType = await this.moduleTypeRepository.findOne({
    //         where: { id: moduleTypeId },
    //     });

    //     if (!moduleType) {
    //         throw new HttpException(
    //             `ModuleType with ID ${moduleTypeId} not found`,
    //             HttpStatus.NOT_FOUND,
    //         );
    //     }

    //     const savedExam = await this.examService.createExam(exam);

    //     const { savedQuestions, errors } =
    //         await this.questionService.saveExamQuestion(question);

    //     if (errors.length > 0) {
    //         throw new HttpException(
    //             `Failed to save some questions: ${errors.map((e) => e.message).join(', ')}`,
    //             HttpStatus.BAD_REQUEST,
    //         );
    //     }

    //     const savedExamQuestions: ExamQuestion[] = [];

    //     for (const question of savedQuestions) {
    //         if (!question.id) {
    //             throw new HttpException(
    //                 'Question ID is missing after saving.',
    //                 HttpStatus.INTERNAL_SERVER_ERROR,
    //             );
    //         }
    //         const newExamQuestion = this.examQuestionRepository.create({
    //             exam: savedExam,
    //             question: question,
    //             moduleType,
    //             status: true,
    //         });

    //         const savedExamQuestion =
    //             await this.examQuestionRepository.save(newExamQuestion);
    //         savedExamQuestions.push(savedExamQuestion);
    //     }

    //     return savedExamQuestions;
    // }

    async createExamQuestion(
        examId: string,
        createExamQuestionDto: CreateExamQuestionDTO[],
    ) {
        for (const createExamQuestionData of createExamQuestionDto) {
            const moduleType = await this.moduleTypeRepository.findOne({
                where: { id: createExamQuestionData.moduleId },
            });

            const exam = await this.examRepository.findOne({
                where: { id: examId },
            });

            if (!moduleType) {
                throw new NotFoundException('ModuleType is not found');
            }

            if (!exam) {
                throw new NotFoundException('Exam is not found');
            }

            for (const domainData of createExamQuestionData.domains) {
                const domain = await this.domainRepository.findOne({
                    where: { content: domainData.domain },
                });

                if (!domain) {
                    throw new NotFoundException('Domain is not found');
                }

                for (const questionData of domainData.questions) {
                    const question = await this.questionRepository.findOne({
                        where: { id: questionData.id },
                    });

                    if (!question) {
                        throw new NotFoundException('Question is not found');
                    }

                    const createExamQuestion = await this.examQuestionRepository.create({
                        moduleType: moduleType,
                        exam: exam,
                        question: question,
                    });

                    await this.examQuestionRepository.save(createExamQuestion);
                }
            }
        }
    }

    async updateExamQuestion(updateExamQuestion: UpdateExamQuestion) {
        const updateDeleteArrays = [];

        for (const updateDeleteExamQuestionData of updateExamQuestion.updateDeleteExamQuestion) {
            const examQuestion = await this.examQuestionRepository.findOne({
                where: { question: { id: updateDeleteExamQuestionData.id } },
            });

            if (!examQuestion) {
                throw new NotFoundException('Question is not found');
            }

            updateDeleteArrays.push(examQuestion);
        }

        await this.examQuestionRepository.delete(updateDeleteArrays);

        const updateQuestionArrays = [];
        let examIdToUpdateStatus = null;

        for (const updateQuestionData of updateExamQuestion.updateQuestion) {
            const exam = await this.examRepository.findOne({
                where: { id: updateQuestionData.examId },
            });

            const moduleType = await this.moduleTypeRepository.findOne({
                where: { id: updateQuestionData.moduleTypeId },
            });

            const question = await this.questionRepository.findOne({
                where: { id: updateQuestionData.questionId },
            });

            if (!question) {
                throw new NotFoundException('Question is not found');
            }

            if (!exam) {
                throw new NotFoundException('Exam is not found');
            }

            if (!moduleType) {
                throw new NotFoundException('Module is not found');
            }

            const createQuestion = await this.examQuestionRepository.create({
                exam: { id: exam.id },
                moduleType: { id: moduleType.id },
                question: { id: question.id },
            });

            const savedQuestion = await this.examQuestionRepository.save(createQuestion);

            updateQuestionArrays.push(savedQuestion);

            examIdToUpdateStatus = exam.id;
        }

        if (examIdToUpdateStatus) {
            await this.examRepository.update(
                { id: examIdToUpdateStatus },
                { status: ExamStatus.PENDING },
            );
        }

        return updateQuestionArrays;
    }
}
