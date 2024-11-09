import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { QuizQuestion } from './quizquestion.entity';

@Entity('quizanswer')
export class QuizAnswer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => QuizQuestion, (quizQuestion) => quizQuestion.answers)
    @JoinColumn({ name: 'quizquestionid' })
    quizquestion: QuizQuestion;

    @CreateDateColumn({ type: 'timestamp' })
    createdat: Date;

    @Column({ type: 'uuid', nullable: true })
    createdby: string;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedat: Date;

    @Column({ type: 'uuid', nullable: true })
    updatedby: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    label: string;

    @Column({ type: 'text', nullable: true })
    text: string;

    @Column({ type: 'text', nullable: true })
    plaintext: string;

    @Column({ type: 'boolean', default: false })
    isCorrectAnswer: boolean;
}
