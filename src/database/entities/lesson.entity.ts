import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UnitArea } from './unitarea.entity';
import { LessonContent } from './lessoncontent.entity';
import { LessonType } from 'src/common/enums/lesson-type.enum';

@Entity('lesson')
export class Lesson {
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

  @ManyToOne(() => UnitArea, (unitArea) => unitArea.lessons)
  @JoinColumn({ name: 'unitareaid' })
  unitArea: UnitArea;

  @Column({ type: 'uuid', nullable: true })
  prerequisitelessonid: string;

  @Column({ type: 'enum', enum: LessonType, default: LessonType.TEXT })
  type: LessonType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @OneToMany(() => LessonContent, (lessonContent) => lessonContent.lesson, { cascade: true })
  lessonContents: LessonContent[];
}
