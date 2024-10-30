import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { Skill } from './skill.entity';

@Entity('quizconfig')
export class QuizConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createdat: Date;

    @Column({ type: 'uuid', nullable: true })
    createdby: string;

    @UpdateDateColumn()
    updatedat: Date;

    @Column({ type: 'uuid', nullable: true })
    updatedby: string;

    @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quizid' })
    quiz: Quiz;

    @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'skillid' })
    skill: Skill;

    @Column({ type: 'int' })
    totalquestion: number;
}
