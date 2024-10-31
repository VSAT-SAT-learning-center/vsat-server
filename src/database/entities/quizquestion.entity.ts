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
import { Skill } from './skill.entity';
import { Quiz } from './quiz.entity';
import { Level } from './level.entity';
import { Section } from './section.entity';
import { QuizAnswer } from './quizanswer.entity';
import { QuizQuestionStatus } from 'src/common/enums/quiz-question.status.enum';

@Entity('quizquestion')
export class QuizQuestion {
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

    @ManyToOne(() => Skill)
    @JoinColumn({ name: 'skillid' })
    skill: Skill;

    @ManyToOne(() => Level)
    @JoinColumn({ name: 'levelid' })
    level: Level;

    @OneToMany(() => QuizAnswer, (quizAnswer) => quizAnswer.quizquestion)
    answers: QuizAnswer[];

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'text', nullable: true })
    plainContent: string;

    @Column({ type: 'text', nullable: true })
    explain: string;

    @Column({
        type: 'enum',
        enum: QuizQuestionStatus,
        default: QuizQuestionStatus.DRAFT,
    })
    status: QuizQuestionStatus;

    @Column({ type: 'boolean', nullable: true })
    isSingleChoiceQuestion: boolean;
}
