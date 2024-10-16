import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { StudyProfile } from './studyprofile.entity';
import { Unit } from './unit.entity';
import { UnitAreaProgress } from './unitareaprogress.entity';

@Entity('unitprogress')
export class UnitProgress {
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

  @ManyToOne(() => StudyProfile)
  @JoinColumn({ name: 'studyprofileid' })
  studyProfile: StudyProfile;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unitid' })
  unit: Unit;

  @Column({ type: 'int', nullable: true })
  progress: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  status: string;

  // One-to-many relationship
  @OneToMany(() => UnitAreaProgress, (unitAreaProgress) => unitAreaProgress.unitProgress, { cascade: true })
  unitAreaProgresses: UnitAreaProgress[];
}
