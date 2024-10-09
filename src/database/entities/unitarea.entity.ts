import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Unit } from './unit.entity';
import { Lesson } from './lesson.entity';

@Entity('unitarea')
export class UnitArea {
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

  @ManyToOne(() => Unit, (unit) => unit.unitAreas)
  @JoinColumn({ name: 'unitid' })
  unit: Unit;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  //OneToMany
  @OneToMany(() => Lesson, (lesson) => lesson.unitArea)
  lessons: Lesson[];
}
