import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    OneToOne,
    ManyToOne,
} from 'typeorm';
import { Unit } from './unit.entity';
import { QuizConfig } from './quizconfig.entity';

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

    @ManyToOne(() => QuizConfig, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quizconfigid' })
    quizconfig: QuizConfig;

    @Column({ type: 'int', nullable: true })
    totalquestion: number;

    @Column({ type: 'boolean', default: false })
    status: boolean;
}
