import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from 'src/database/entities/anwser.entity';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { ExamAttemptDetail } from 'src/database/entities/examattemptdetail.entity';
import { Question } from 'src/database/entities/question.entity';
import { Repository } from 'typeorm';
import { CheckExamAttemptDetail } from './dto/check-examattemptdetail';
import sanitizeHtml from 'sanitize-html';

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

    normalizeContent(content: string): string {
        const strippedContent = sanitizeHtml(content, {
            allowedTags: [],
            allowedAttributes: {},
        });

        return strippedContent.replace(/\s+/g, ' ').trim();
    }

    async check(
        checkExamAttemptDetails: CheckExamAttemptDetail[],
        examAttemptId: string,
    ): Promise<CheckExamAttemptDetail[]> {
        const results: CheckExamAttemptDetail[] = [];
        const batchSize = 30;
        const examAttempt = await this.examAttemptRepository.findOne({
            where: { id: examAttemptId },
        });

        if (!examAttempt) {
            throw new NotFoundException('ExamAttempt not found');
        }

        for (let i = 0; i < checkExamAttemptDetails.length; i += batchSize) {
            const batch = checkExamAttemptDetails.slice(i, i + batchSize);
            const batchEntities = [];

            for (const checkExamAttemptDetail of batch) {
                const question = await this.questionRepository.findOne({
                    where: { id: checkExamAttemptDetail.questionid },
                });

                if (!question) {
                    throw new NotFoundException('Question not found');
                }

                const normalizedText = this.normalizeContent(
                    checkExamAttemptDetail.studentanswer,
                );

                const answers = await this.answerRepository.find({
                    where: { question: { id: checkExamAttemptDetail.questionid } },
                });

                checkExamAttemptDetail.isCorrect = this.evaluateAnswer(
                    question.isSingleChoiceQuestion,
                    answers,
                    normalizedText,
                );

                const examAttemptDetailEntity = this.examAttemptDetailRepository.create({
                    examAttempt: examAttempt,
                    question: question,
                    iscorrect: checkExamAttemptDetail.isCorrect,
                    studentAnswer: checkExamAttemptDetail.studentanswer,
                });

                batchEntities.push(examAttemptDetailEntity);

                results.push({
                    ...checkExamAttemptDetail,
                    isCorrect: checkExamAttemptDetail.isCorrect,
                });
            }

            await this.examAttemptDetailRepository.save(batchEntities);
        }

        return results;
    }

    private evaluateAnswer(
        isSingleChoiceQuestion: boolean,
        answers: Answer[],
        normalizedText: string,
    ): boolean {
        if (isSingleChoiceQuestion) {
            const answer = answers.find((answer) => answer.plaintext === normalizedText);
            return !!answer?.isCorrectAnswer;
        } else {
            const correctAnswer = answers.find(
                (answer) => answer.plaintext === normalizedText,
            );
            return !!correctAnswer;
        }
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

    async countCorrectAnswersBySection(examAttemptId: string): Promise<{ [section: string]: number }> {
        const mathCount = await this.examAttemptDetailRepository.count({
            where: {
                examAttempt: { id: examAttemptId },
                question: { section: { name: 'Math' } },
                iscorrect: true,
            },
        });
    
        const readingWritingCount = await this.examAttemptDetailRepository.count({
            where: {
                examAttempt: { id: examAttemptId },
                question: { section: { name: 'Reading & Writing' } },
                iscorrect: true,
            },
        });
    
        return {
            Math: mathCount,
            'Reading & Writing': readingWritingCount,
        };
    }
    
}
