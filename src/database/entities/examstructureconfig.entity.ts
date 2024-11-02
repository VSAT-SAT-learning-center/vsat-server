import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import { ExamStructure } from './examstructure.entity';
import { Domain } from './domain.entity';

@Entity('examstructureconfig')
export class ExamStructureConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, type: 'uuid' })
  createdBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, type: 'uuid' })
  updatedBy: string;

  @ManyToOne(() => ExamStructure)
  @JoinColumn({ name: 'examStructureId' })
  examStructure: ExamStructure;

  @ManyToOne(() => Domain)
  @JoinColumn({ name: 'domainId' })
  domain: Domain;

  @Column('int')
  numberOfQuestion: number;

}
