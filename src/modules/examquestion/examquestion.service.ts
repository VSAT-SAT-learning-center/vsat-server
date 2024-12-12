import { plainToInstance } from 'class-transformer';
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamQuestion } from 'src/database/entities/examquestion.entity';
import { Repository } from 'typeorm';
import { CreateExamQuestionDTO } from './dto/create-examquestion.dto';
import { Question } from 'src/database/entities/question.entity';
import { Exam } from 'src/database/entities/exam.entity';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { Domain } from 'src/database/entities/domain.entity';
import { UpdateExamQuestion } from './dto/update-examquestion.dto';
import { ExamStatus } from 'src/common/enums/exam-status.enum';

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
        }

        return updateQuestionArrays;
    }
}
