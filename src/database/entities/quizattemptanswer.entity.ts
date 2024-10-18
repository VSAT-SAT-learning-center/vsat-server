import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { QuizAttempt } from './quizattempt.entity';
import { QuizQuestion } from './quizquestion.entity';

@Entity('quizattemptanswer')
export class QuizAttemptAnswer {
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

    @ManyToOne(() => QuizAttempt)
    @JoinColumn({ name: 'quizattemptid' })
    quizAttempt: QuizAttempt;

    @ManyToOne(() => QuizQuestion)
    @JoinColumn({ name: 'quizquestionid' })
    quizQuestion: QuizQuestion;

    @Column({ type: 'boolean', default: false })
    iscorrect: boolean;
}
