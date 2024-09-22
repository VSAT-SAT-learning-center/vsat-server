import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Quiz } from './quiz.entity';
import { Skill } from './skill.entity';

@Entity('quizskill')
export class QuizSkill {
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

  @ManyToOne(() => Quiz)
  @JoinColumn({ name: 'quizid' })
  quiz: Quiz;

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skillid' })
  skill: Skill;
}
