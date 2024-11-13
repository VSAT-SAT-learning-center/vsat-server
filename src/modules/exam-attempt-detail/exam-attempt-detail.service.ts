import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from 'src/database/entities/anwser.entity';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { ExamAttemptDetail } from 'src/database/entities/examattemptdetail.entity';
import { Question } from 'src/database/entities/question.entity';
import { Repository } from 'typeorm';
import { CheckExamAttemptDetail } from './dto/check-examattemptdetail';

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

    async check(checkExamAttemptDetails: CheckExamAttemptDetail[], examAttemptId: string): Promise<CheckExamAttemptDetail[]> {
        const results: CheckExamAttemptDetail[] = [];

        for (const checkExamAttemptDetail of checkExamAttemptDetails) {
            const examAttempt = await this.examAttemptRepository.findOne({
                where: { id: examAttemptId },
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

            if (question.isSingleChoiceQuestion === true) {
                const answer = answers.find((answer) => answer.plaintext === checkExamAttemptDetail.studentanswer);
                
                if (!answer.isCorrectAnswer) {
                    checkExamAttemptDetail.isCorrect = false;
                } else if (answer.isCorrectAnswer) {
                    checkExamAttemptDetail.isCorrect = true;
                }
            } else if (question.isSingleChoiceQuestion === false) {
                const correctAnswer = answers.find((answer) => answer.plaintext === checkExamAttemptDetail.studentanswer);

                if (correctAnswer) {
                    checkExamAttemptDetail.isCorrect = true;
                } else {
                    checkExamAttemptDetail.isCorrect = false;
                }
            }

            const examAttemptDetailEntity = this.examAttemptDetailRepository.create({
                examAttempt: examAttempt,
                question: question,
                iscorrect: checkExamAttemptDetail.isCorrect,
                studentAnswer: checkExamAttemptDetail.studentanswer,
            });

            const savedExamAttemptDetail = await this.examAttemptDetailRepository.save(examAttemptDetailEntity);

            results.push({
                ...checkExamAttemptDetail,
                isCorrect: savedExamAttemptDetail.iscorrect,
            });
        }

        return results;
    }

    async countCorrectAnswers(
        examAttemptId: string,
        sectionName: string,
    ): Promise<number> {
        return this.examAttemptDetailRepository.count({
            where: {
                examAttempt: { id: examAttemptId },
                question: { section: { name: sectionName } },
                iscorrect: true,
            },
        });
    }
}
