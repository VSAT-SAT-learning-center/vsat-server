import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ExamScore } from './examscore.entity';
import { ExamStructureType } from './examstructuretype.entity';
import { ExamStructureConfig } from './examstructureconfig.entity';

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

  @ManyToOne(() => ExamStructureType)
  @JoinColumn({ name: 'examStructureTypeId' })
  examStructureType: ExamStructureType;

  @Column({ type: 'varchar', length: 255 })
  structurename: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('int', { nullable: true })
  requiredCorrectInModule1RW: number;

  @Column('int', { nullable: true })
  requiredCorrectInModule1M: number;

  @OneToMany(() => ExamStructureConfig, (config) => config.examStructure)
  configs: ExamStructureConfig[];
}
