import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { Unit } from './unit.entity';
import { Level } from './level.entity';
import { Skill } from './skill.entity';
import { Lesson } from './lesson.entity';
import { QuestionStatus } from 'src/common/enums/question-status.enum';

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

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'text', nullable: true })
    answer1: string;

    @Column({ type: 'text', nullable: true })
    answer2: string;

    @Column({ type: 'text', nullable: true })
    answer3: string;

    @Column({ type: 'text', nullable: true })
    answer4: string;

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
