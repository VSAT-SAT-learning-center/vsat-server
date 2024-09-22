import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Exam } from './exam.entity';
import { ModuleType } from './moduletype.entity';
import { Question } from './question.entity';

@Entity('examquestion')
export class ExamQuestion {
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

  @ManyToOne(() => ModuleType)
  @JoinColumn({ name: 'moduletypeid' })
  moduleType: ModuleType;

  @ManyToOne(() => Exam)
  @JoinColumn({ name: 'examid' })
  exam: Exam;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questionid' })
  question: Question;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}
