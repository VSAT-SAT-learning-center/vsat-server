import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
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

    @CreateDateColumn({ type: 'timestamp' })
    createdat: Date;

    @Column({ type: 'uuid', nullable: true })
    createdby: string;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedat: Date;

    @Column({ type: 'uuid', nullable: true })
    updatedby: string;
}
