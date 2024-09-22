import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExamAttempt } from './examattempt.entity';
import { Question } from './question.entity';

@Entity('examattemptdetail')
export class ExamAttemptDetail {
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

  @ManyToOne(() => ExamAttempt)
  @JoinColumn({ name: 'examattemptid' })
  examAttempt: ExamAttempt;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questionid' })
  question: Question;

  @Column({ type: 'boolean', default: false })
  iscorrect: boolean;
}
