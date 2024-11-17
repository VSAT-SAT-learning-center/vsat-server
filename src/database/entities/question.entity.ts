import { QuestionStatus } from 'src/common/enums/question-status.enum';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { Answer } from './anwser.entity';
import { Level } from './level.entity';
import { Section } from './section.entity';
import { Skill } from './skill.entity';
import { ExamQuestion } from './examquestion.entity';
import { ExamAttemptDetail } from './examattemptdetail.entity';
import { Feedback } from './feedback.entity';

@Entity('question')
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

    @ManyToOne(() => Level)
    @JoinColumn({ name: 'levelid' })
    level: Level;

    @ManyToOne(() => Skill)
    @JoinColumn({ name: 'skillid' })
    skill: Skill;

    @ManyToOne(() => Section)
    @JoinColumn({ name: 'sectionid' })
    section: Section;

    @OneToMany(() => Answer, (answer) => answer.question)
    answers: Answer[];

    @OneToMany(() => ExamQuestion, (examquestion) => examquestion.question)
    examquestion: ExamQuestion[];

    @OneToMany(() => ExamAttemptDetail, (examattemptdetail) => examattemptdetail.question)
    examattemptdetail: ExamAttemptDetail[];

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'text', nullable: true })
    plainContent: string;

    @Column({ type: 'text', nullable: true })
    explain: string;

    @Column({ type: 'int', nullable: true })
    sort: number;

    @Column({ type: 'boolean', nullable: true })
    isSingleChoiceQuestion: boolean;

    @Column({
        type: 'enum',
        enum: QuestionStatus,
        default: QuestionStatus.DRAFT,
    })
    status: QuestionStatus;

    @Column({ type: 'int', nullable: true })
    countfeedback: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @OneToMany(() => Feedback, (feedback) => feedback.question)
    feedbacks: Feedback[];
}
