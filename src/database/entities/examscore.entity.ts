import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ExamStructure } from './examstructure.entity';
import { ExamScoreDetail } from './examscoredetail.entity';
import { ExamStructureType } from './examstructuretype.entity';

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

  @ManyToOne(() => ExamStructureType)
  @JoinColumn({ name: 'examStructureTypeId' })
  examStructureType: ExamStructureType;

  @OneToMany(() => ExamScoreDetail, (examScoreDetail) => examScoreDetail.examScore)
  examScoreDetails: ExamScoreDetail[];
}
