import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Unit } from './unit.entity';
import { Exam } from './exam.entity';
import { Question } from './question.entity';
import { Account } from './account.entity';
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum';
import { Lesson } from './lesson.entity';
import { QuizQuestion } from './quizquestion.entity';
import { ModuleType } from './moduletype.entity';

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

    @ManyToOne(() => Lesson, { nullable: true })
    @JoinColumn({ name: 'lessonid' })
    lesson: Lesson;

    @ManyToOne(() => Exam, { nullable: true })
    @JoinColumn({ name: 'examid' })
    exam: Exam;

    @ManyToOne(() => ModuleType, { nullable: true })
    @JoinColumn({ name: 'moduletypeid' })
    moduleType: ModuleType;

    @ManyToOne(() => Question, { nullable: true })
    @JoinColumn({ name: 'questionid' })
    question: Question;

    @ManyToOne(() => QuizQuestion, { nullable: true })
    @JoinColumn({ name: 'quizquestionid' })
    quizquestion: QuizQuestion;

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
}

