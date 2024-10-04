import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
    OneToMany,
} from 'typeorm';
import { Unit } from './unit.entity';
import { Level } from './level.entity';
import { Skill } from './skill.entity';
import { Lesson } from './lesson.entity';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { Answer } from './anwser.entity';

@Entity('question')
@Unique(['content'])
export class Question {
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

    @ManyToOne(() => Level)
    @JoinColumn({ name: 'levelid' })
    level: Level;

    @ManyToOne(() => Skill)
    @JoinColumn({ name: 'skillid' })
    skill: Skill;

    @ManyToOne(() => Lesson)
    @JoinColumn({ name: 'lessonid' })
    lesson: Lesson;

    @OneToMany(() => Answer, (answer) => answer.question)
    answers: Answer[];

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'int', nullable: true })
    correctoption: number;

    @Column({ type: 'text', nullable: true })
    correctanswer: string;

    @Column({ type: 'text', nullable: true })
    explain: string;

    @Column({ type: 'int', nullable: true })
    sort: number;

    @Column({
        type: 'enum',
        enum: QuestionStatus,
        default: QuestionStatus.SUBMIT,
    })
    status: QuestionStatus;
}
