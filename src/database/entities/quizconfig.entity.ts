import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { Skill } from './skill.entity';
import { Unit } from './unit.entity';

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

    @OneToOne(() => Unit)
    @JoinColumn({ name: 'unitid' })
    unit: Unit;

    @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'skillid' })
    skill: Skill;

    @Column({ type: 'int' })
    totalquestion: number;
}
