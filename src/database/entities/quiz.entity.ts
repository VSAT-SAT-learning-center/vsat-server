import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { QuizConfig } from './quizconfig.entity';
import { QuizQuestionItem } from './quizquestionitem.entity';
import { Unit } from './unit.entity';

@Entity('quiz')
export class Quiz {
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

    @ManyToOne(() => Unit)
    @JoinColumn({ name: 'unitid' })
    unit: Unit;

    @Column({ type: 'int', nullable: true })
    totalquestion: number;

    @Column({ type: 'boolean', default: false })
    status: boolean;

    @OneToMany(() => QuizQuestionItem, (question) => question.quiz)
    quizQuestions: QuizQuestionItem[];
}
