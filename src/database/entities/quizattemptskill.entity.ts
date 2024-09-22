import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { QuizAttempt } from './quizattempt.entity';
import { Skill } from './skill.entity';

@Entity('quizattemptskill')
export class QuizAttemptSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdat: Date;

  @Column({ type: 'uuid', nullable: true })
  createdby: string;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedat: Date;

  @Column({ type: 'uuid', nullable: true })
  updatedby: string;

  @ManyToOne(() => QuizAttempt)
  @JoinColumn({ name: 'quizattemptid' })
  quizAttempt: QuizAttempt;

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skillid' })
  skill: Skill;
}
