import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExamScore } from './examscore.entity';

@Entity('examstructure')
export class ExamStructure {
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

  @ManyToOne(() => ExamScore)
  @JoinColumn({ name: 'examscoreid' })
  examScore: ExamScore;

  @Column({ type: 'varchar', length: 255 })
  structurename: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
