import { plainToInstance } from 'class-transformer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamQuestion } from 'src/database/entities/examquestion.entity';
import { Repository } from 'typeorm';
import { CreateExamQuestionDTO } from './dto/create-examquestion.dto';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { Question } from 'src/database/entities/question.entity';
import { Answer } from 'src/database/entities/anwser.entity';
import { Exam } from 'src/database/entities/exam.entity';
import { QuestionService } from '../question/question.service';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { ExamService } from '../exam/exam.service';

@Injectable()
export class ExamQuestionService {
    constructor(
        @InjectRepository(ExamQuestion)
        private readonly examQuestionRepository: Repository<ExamQuestion>,
        @InjectRepository(ModuleType)
        private readonly moduleTypeRepository: Repository<ModuleType>,
        private readonly questionService: QuestionService,
        private readonly examService: ExamService,
    ) {}

    async createExamQuestion(
        createExamQuestionDto: CreateExamQuestionDTO,
    ): Promise<ExamQuestion[]> {
        const { exam, question, moduleTypeId } = createExamQuestionDto;

        const moduleType = await this.moduleTypeRepository.findOne({
            where: { id: moduleTypeId },
        });

        if (!moduleType) {
            throw new HttpException(
                `ModuleType with ID ${moduleTypeId} not found`,
                HttpStatus.NOT_FOUND,
            );
        }
        
        const savedExam = await this.examService.createExam(exam);

        const savedQuestions = await this.questionService.save(question);

        const savedExamQuestions: ExamQuestion[] = [];

        for (const question of savedQuestions) {
            if (!question.id) {
                throw new HttpException(
                    'Question ID is missing after saving.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
            const newExamQuestion = this.examQuestionRepository.create({
                exam: savedExam,
                question: question,
                moduleType,
                status: true,
            });

            const savedExamQuestion =
                await this.examQuestionRepository.save(newExamQuestion);
            savedExamQuestions.push(savedExamQuestion);
        }

        return savedExamQuestions;
    }
}
