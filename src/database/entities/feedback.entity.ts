import { FeedbackStatus } from 'src/common/enums/feedback-status.enum';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { Exam } from './exam.entity';
import { Lesson } from './lesson.entity';
import { Question } from './question.entity';
import { Unit } from './unit.entity';
import { UnitArea } from './unitarea.entity';

@Entity('feedback')
export class Feedback {
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

    @ManyToOne(() => Unit, { nullable: true })
    @JoinColumn({ name: 'unitid' })
    unit: Unit;

    @ManyToOne(() => UnitArea, { nullable: true })
    @JoinColumn({ name: 'unitareaid' })
    unitArea: Unit;

    @ManyToOne(() => Lesson, { nullable: true })
    @JoinColumn({ name: 'lessonid' })
    lesson: Unit;

    @ManyToOne(() => Exam, { nullable: true })
    @JoinColumn({ name: 'examid' })
    exam: Exam;

    @ManyToOne(() => Question, { nullable: true })
    @JoinColumn({ name: 'questionid' })
    question: Question;

    @ManyToOne(() => Account)
    @JoinColumn({ name: 'accountfromid' })
    accountFrom: Account;

    @ManyToOne(() => Account, { nullable: true })
    @JoinColumn({ name: 'accounttoid' })
    accountTo: Account;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'enum', enum: FeedbackStatus })
    status: FeedbackStatus;

    @Column({ type: 'text', nullable: true }) 
    reason: string;

    @Column({ type: 'boolean', default: false })
    isRead: boolean;
}
