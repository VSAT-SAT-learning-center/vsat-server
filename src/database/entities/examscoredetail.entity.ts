import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Section } from './section.entity';
import { ExamStructure } from './examstructure.entity';

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

  @ManyToOne(() => ExamStructure)
  @JoinColumn({ name: 'examstructureid' })
  examStructure: ExamStructure;

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
