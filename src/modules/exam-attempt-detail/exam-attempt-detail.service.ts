import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamAttemptDetailDto } from './dto/create-examattemptdetail.dto';
import { UpdateExamAttemptDetailDto } from './dto/update-examattemptdetail.dto';
import { ExamAttemptDetail } from 'src/database/entities/examattemptdetail.entity';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { CheckExamAttemptDetail } from './dto/check-examattemptdetail';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { Question } from 'src/database/entities/question.entity';
import { Answer } from 'src/database/entities/anwser.entity';

@Injectable()
export class ExamAttemptDetailService {
    constructor(
        @InjectRepository(ExamAttemptDetail)
        private readonly examAttemptDetailRepository: Repository<ExamAttemptDetail>,

        @InjectRepository(ExamAttempt)
        private readonly examAttemptRepository: Repository<ExamAttempt>,

        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,

        @InjectRepository(Answer)
        private readonly answerRepository: Repository<Answer>,
    ) {}

    async check(
        checkExamAttemptDetails: CheckExamAttemptDetail[],
    ): Promise<CheckExamAttemptDetail[]> {
        const results: CheckExamAttemptDetail[] = [];

        for (const checkExamAttemptDetail of checkExamAttemptDetails) {
            const examAttempt = await this.examAttemptRepository.findOne({
                where: { id: checkExamAttemptDetail.examattemptid },
            });

            const question = await this.questionRepository.findOne({
                where: { id: checkExamAttemptDetail.questionid },
            });

            if (!examAttempt) {
                throw new NotFoundException('ExamAttempt not found');
            }

            if (!question) {
                throw new NotFoundException('Question not found');
            }

            const answers = await this.answerRepository.find({
                where: { question: { id: checkExamAttemptDetail.questionid } },
            });

            if (question.IsSingleChoiceQuestion === true) {
                const correctAnswer = answers.find(
                    (answer) =>
                        answer.label === checkExamAttemptDetail.studentanswer,
                );

                if (!correctAnswer.isCorrectAnswer) {
                    checkExamAttemptDetail.isCorrect = false;
                } else if (correctAnswer.isCorrectAnswer) {
                    checkExamAttemptDetail.isCorrect = true;
                }
            } else if (question.IsSingleChoiceQuestion === false) {
                const correctAnswer = answers.find(
                    (answer) =>
                        answer.text === checkExamAttemptDetail.studentanswer,
                );

                console.log(correctAnswer);

                if (correctAnswer) {
                    checkExamAttemptDetail.isCorrect = true;
                } else {
                    checkExamAttemptDetail.isCorrect = false;
                }
            }

            const examAttemptDetailEntity =
                this.examAttemptDetailRepository.create({
                    examAttempt: examAttempt,
                    question: question,
                    iscorrect: checkExamAttemptDetail.isCorrect,
                    studentAnswer: checkExamAttemptDetail.studentanswer,
                });

            const savedExamAttemptDetail =
                await this.examAttemptDetailRepository.save(
                    examAttemptDetailEntity,
                );

            results.push({
                ...checkExamAttemptDetail,
                isCorrect: savedExamAttemptDetail.iscorrect,
            });
        }

        return results;
    }
}
