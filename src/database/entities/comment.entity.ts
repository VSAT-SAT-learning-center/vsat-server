import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';
import { Lesson } from './lesson.entity';

@Entity('comment')
export class Comment {
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

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountid' })
  account: Account;

  @Column({ type: 'uuid', nullable: true })
  parentcommentid: string;

  @Column({ type: 'uuid', nullable: true })
  childcommentid: string;

  @ManyToOne(() => Lesson)
  @JoinColumn({ name: 'lessonid' })
  lesson: Lesson;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}
