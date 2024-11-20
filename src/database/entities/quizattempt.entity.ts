import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { StudyProfile } from './studyprofile.entity';
import { Quiz } from './quiz.entity';
import { QuizAttemptAnswer } from './quizattemptanswer.entity';
import { QuizAttemptStatus } from 'src/common/enums/quiz-attempt-status.enum';
import { UnitProgress } from './unitprogress.entity';

@Entity('quizattempt')
export class QuizAttempt {
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

    @ManyToOne(() => UnitProgress)
    @JoinColumn({ name: 'unitprogressid' })
    unitProgress: UnitProgress;

    @ManyToOne(() => Quiz)
    @JoinColumn({ name: 'quizid' })
    quiz: Quiz;

    @Column({ type: 'timestamp', nullable: true })
    attemptdatetime: Date;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    score: number;

    @Column({
        type: 'enum',
        enum: QuizAttemptStatus,
        default: QuizAttemptStatus.NOT_STARTED,
    })
    status: QuizAttemptStatus;

    //One to many
    @OneToMany(() => QuizAttemptAnswer, (answer) => answer.quizAttempt)
    answers: QuizAttemptAnswer[];
}
