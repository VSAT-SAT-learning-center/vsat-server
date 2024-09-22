import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Skill } from './skill.entity';
import { Quiz } from './quiz.entity';

@Entity('quizquestion')
export class QuizQuestion {
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

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skillid' })
  skill: Skill;

  @ManyToOne(() => Quiz)
  @JoinColumn({ name: 'quizid' })
  quiz: Quiz;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'text', nullable: true })
  answer1: string;

  @Column({ type: 'text', nullable: true })
  answer2: string;

  @Column({ type: 'text', nullable: true })
  answer3: string;

  @Column({ type: 'text', nullable: true })
  answer4: string;

  @Column({ type: 'int', nullable: true })
  correctoption: number;

  @Column({ type: 'text', nullable: true })
  correctanswer: string;

  @Column({ type: 'text', nullable: true })
  explain: string;

  @Column({ type: 'int', nullable: true })
  sort: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}
