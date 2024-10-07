import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Section } from './section.entity';
import { Level } from './level.entity';
import { UnitArea } from './unitarea.entity';

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
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  // One-to-many relationship with UnitArea
  @OneToMany(() => UnitArea, (unitArea) => unitArea.unit, { cascade: true })
  unitAreas: UnitArea[]; // Unit can have many UnitAreas
}
