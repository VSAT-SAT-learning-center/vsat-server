import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Section } from './section.entity';
import { ExamStructure } from './examstructure.entity';

@Entity('moduletype')
export class ModuleType {
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

  @ManyToOne(() => Section)
  @JoinColumn({ name: 'sectionid' })
  section: Section;

  @ManyToOne(() => ExamStructure)
  @JoinColumn({ name: 'examstructureid' })
  examStructure: ExamStructure;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  level: string;

  @Column({ type: 'int', nullable: true })
  numberofquestion: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}
