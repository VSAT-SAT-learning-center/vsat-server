import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Section } from './section.entity';
import { Level } from './level.entity';
import { UnitArea } from './unitarea.entity';
import { Feedback } from './feedback.entity';
import { UnitStatus } from 'src/common/enums/unit-status.enum';

@Entity('unit')
export class Unit {
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

  @ManyToOne(() => Level)
  @JoinColumn({ name: 'levelid' })
  level: Level;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: UnitStatus, default: UnitStatus.DRAFT })
  status: UnitStatus;

  // One-to-many relationship
  @OneToMany(() => UnitArea, (unitArea) => unitArea.unit, { cascade: true })
  unitAreas: UnitArea[];

  @OneToMany(() => Feedback, (feedback) => feedback.unit)
  feedbacks: Feedback[];
}
