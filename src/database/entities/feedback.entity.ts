import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Unit } from './unit.entity';
import { Exam } from './exam.entity';
import { Question } from './question.entity';
import { Account } from './account.entity';

@Entity('feedback')
export class Feedback {
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

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unitid' })
  unit: Unit;

  @ManyToOne(() => Exam)
  @JoinColumn({ name: 'examid' })
  exam: Exam;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questionid' })
  question: Question;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountid' })
  account: Account;

  @Column({ type: 'text', nullable: true })
  content: string;
}
