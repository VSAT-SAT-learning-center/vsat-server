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
import { ExamStructure } from './examstructure.entity';
import { ExamType } from './examtype.entity';
import { ExamQuestion } from './examquestion.entity';
import { ExamStatus } from 'src/common/enums/exam-status.enum';
import { Feedback } from './feedback.entity';

@Entity('exam')
export class Exam {
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

    @ManyToOne(() => ExamStructure)
    @JoinColumn({ name: 'examstructureid' })
    examStructure: ExamStructure;

    @ManyToOne(() => ExamType)
    @JoinColumn({ name: 'examtypeid' })
    examType: ExamType;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: ExamStatus,
        default: ExamStatus.PENDING,
    })
    status: ExamStatus;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'int', nullable: true })
    countfeedback: number;

    @OneToMany(() => ExamQuestion, (examQuestion) => examQuestion.exam)
    examquestion: ExamQuestion[];

    @OneToMany(() => Feedback, (feedback) => feedback.exam)
    feedbacks: Feedback[];
}
