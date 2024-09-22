import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExamScore } from './examscore.entity';
import { Section } from './section.entity';

@Entity('examscoredetail')
export class ExamScoreDetail {
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

  @ManyToOne(() => Section)
  @JoinColumn({ name: 'sectionid' })
  section: Section;

  @Column({ type: 'int', nullable: true })
  rawscore: number;

  @Column({ type: 'int', nullable: true })
  lowerscore: number;

  @Column({ type: 'int', nullable: true })
  upperscore: number;
}
