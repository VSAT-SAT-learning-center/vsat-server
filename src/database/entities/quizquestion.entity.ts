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
import { QuizStatus } from 'src/common/enums/quiz.status.enum';

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

    @ManyToOne(() => Quiz)
    @JoinColumn({ name: 'quizid' })
    quiz: Quiz;

    @ManyToOne(() => Level)
    @JoinColumn({ name: 'levelid' })
    level: Level;

    @ManyToOne(() => Section)
    @JoinColumn({ name: 'sectionid' })
    section: Section;

    @OneToMany(() => QuizAnswer, (quizAnswer) => quizAnswer.quizquestion)
    answers: QuizAnswer[];

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'text', nullable: true })
    explain: string;

    @Column({
        type: 'enum',
        enum: QuizStatus,
        default: QuizStatus.DRAFT,
    })
    status: QuizStatus;

    @Column({ type: 'boolean', nullable: true })
    isSingleChoiceQuestion: boolean;
}
