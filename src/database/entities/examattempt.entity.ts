import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';
import { StudyProfile } from './studyprofile.entity';
import { Exam } from './exam.entity';
import { ExamAttemptDetail } from './examattemptdetail.entity';
import { TargetLearning } from './targetlearning.entity';

@Entity('examattempt')
export class ExamAttempt {
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

    @OneToOne(() => TargetLearning, (targetlearning) => targetlearning.examattempt)
    @JoinColumn({ name: 'targetlearningid' })
    targetlearning: TargetLearning;

    @ManyToOne(() => Exam)
    @JoinColumn({ name: 'examid' })
    exam: Exam;

    @OneToMany(
        () => ExamAttemptDetail,
        (examattemptdetail) => examattemptdetail.examAttempt,
    )
    examattemptdetail: ExamAttemptDetail[];

    @Column({ type: 'date', nullable: true })
    attemptdatetime: Date;

    @Column({ type: 'int', nullable: true })
    scoreMath: number;

    @Column({ type: 'int', nullable: true })
    scoreRW: number;

    @Column({ type: 'boolean', default: false })
    status: boolean;
}
