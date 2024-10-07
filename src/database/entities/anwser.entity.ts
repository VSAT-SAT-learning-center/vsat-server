import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './question.entity';

@Entity('answer')
export class Answer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Question, (question) => question.answers)
    @JoinColumn({ name: 'questionid' })
    question: Question;

    @Column({ type: 'text', nullable: true })
    label: string;

    @Column({ type: 'text', nullable: true })
    text: string;

    @Column({ type: 'boolean', nullable: true })
    isCorrectAnswer: boolean;
}
