import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Lesson } from './lesson.entity';
import { ContentType } from 'src/common/enums/content-type.enum';
import { Content } from './embedded-entity/content.embedded';
import { Question } from './embedded-entity/question.embedded';

@Entity('lessoncontent')
export class LessonContent {
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

  @ManyToOne(() => Lesson)
  @JoinColumn({ name: 'lessonid' })
  lesson: Lesson;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url: string;

  @Column({ type: 'int', nullable: true })
  sort: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'enum', enum: ContentType})
  contentType: ContentType;

  @Column('jsonb')
  contents: Content[];

  @Column('jsonb', { nullable: true })
  question: Question | null;
}
