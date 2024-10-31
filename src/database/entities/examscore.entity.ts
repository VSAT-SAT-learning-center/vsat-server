import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ExamStructure } from './examstructure.entity';
import { ExamScoreDetail } from './examscoredetail.entity';

@Entity('examscore')
export class ExamScore {
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

  @Column({ type: 'text'})
  type: string;

  @Column({ type: 'text'})
  title: string;

  @OneToMany(() => ExamScoreDetail, (examScoreDetail) => examScoreDetail.examScore)
  examScoreDetails: ExamScoreDetail[];
}
