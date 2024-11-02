import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuizAttemptDto } from './dto/create-quizattempt.dto';
import { UpdateQuizAttemptDto } from './dto/update-quizattempt.dto';
import { QuizAttempt } from 'src/database/entities/quizattempt.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { QuizQuestionItemService } from '../quiz-question-item/quiz-question-item.service';
import { QuizService } from '../quiz/quiz.service';
import { Skill } from 'src/database/entities/skill.entity';
import { QuizAttemptStatus } from 'src/common/enums/quiz-attempt-status.enum';

@Injectable()
export class QuizAttemptService extends BaseService<QuizAttempt> {
    constructor(
        @InjectRepository(QuizAttempt)
        private readonly quizAttemptRepository: Repository<QuizAttempt>
    ) {
        super(quizAttemptRepository);
    }

    async startQuizAttempt(
        studyProfileId: string,
        quizId: string,
    ): Promise<QuizAttempt> {
        
        // Tạo mới quiz attempt cho học sinh
        const newAttempt = this.quizAttemptRepository.create({
            studyProfile: { id: studyProfileId },
            quiz: { id: quizId },
            attemptdatetime: new Date(),
            status: QuizAttemptStatus.IN_PROGRESS,
        });

        return await this.quizAttemptRepository.save(newAttempt);
    }

    

    async completeQuizAttempt(quizAttemptId: string): Promise<QuizAttempt> {
        const quizAttempt = await this.quizAttemptRepository.findOne({
            where: { id: quizAttemptId },
            relations: ['answers', 'answers.quizQuestion'],
        });

        if (!quizAttempt) {
            throw new NotFoundException(
                `Quiz Attempt with id ${quizAttemptId} not found`,
            );
        }

        // Tính toán điểm
        const totalQuestions = quizAttempt.answers.length;
        const correctAnswers = quizAttempt.answers.filter(
            (a) => a.iscorrect,
        ).length;
        const score = (correctAnswers / totalQuestions) * 100;

        // Cập nhật điểm và trạng thái của quiz attempt
        quizAttempt.score = score;
        return await this.quizAttemptRepository.save(quizAttempt);
    }

    async findWeakSkillsByQuizAttempt(quizAttemptId: string): Promise<Skill[]> {
      // Load the quiz attempt with related answers and questions
      const quizAttempt = await this.quizAttemptRepository.findOne({
          where: { id: quizAttemptId },
          relations: ['answers', 'answers.quizQuestion', 'answers.quizQuestion.skill'],
      });

      if (!quizAttempt) {
          throw new NotFoundException(`Quiz Attempt with id ${quizAttemptId} not found`);
      }

      // Map to accumulate correct/total counts per skill
      const skillAccuracyMap = new Map<string, { skill: Skill; correct: number; total: number }>();

      // Calculate correct and total answer counts per skill
      for (const answer of quizAttempt.answers) {
          const skillId = answer.quizQuestion.skill.id;
          if (!skillAccuracyMap.has(skillId)) {
              skillAccuracyMap.set(skillId, { skill: answer.quizQuestion.skill, correct: 0, total: 0 });
          }
          const skillStats = skillAccuracyMap.get(skillId);
          skillStats.total += 1;
          if (answer.iscorrect) {
              skillStats.correct += 1;
          }
      }

      // Determine weak skills (accuracy < 70%)
      const weakSkills: Skill[] = [];
      for (const { skill, correct, total } of skillAccuracyMap.values()) {
          const accuracy = (correct / total) * 100;
          if (accuracy < 70) {
              weakSkills.push(skill);
          }
      }

      return weakSkills;
  }
}
