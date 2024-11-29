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
import { Level } from './level.entity';
import { Section } from './section.entity';
import { StudyProfile } from './studyprofile.entity';
import { UnitProgress } from './unitprogress.entity';
import { ExamAttempt } from './examattempt.entity';
import { TargetLearningDetail } from './targetlearningdetail.entity';
import { TargetLearningStatus } from 'src/common/enums/target-learning-status.enum';

@Entity('targetlearning')
export class TargetLearning {
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

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    startdate: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    enddate: Date;

    @OneToOne(() => ExamAttempt, (examattempt) => examattempt.targetlearning)
    //@JoinColumn({ name: 'examattemptid' })
    examattempt: ExamAttempt;

    @ManyToOne(() => StudyProfile)
    @JoinColumn({ name: 'studyprofileid' })
    studyProfile: StudyProfile;

    @OneToMany(
        () => TargetLearningDetail,
        (targetlearningdetail) => targetlearningdetail.targetlearning,
    )
    targetlearningdetail: TargetLearningDetail[];

    @Column({
        type: 'enum',
        enum: TargetLearningStatus,
        default: TargetLearningStatus.INACTIVE,
    })
    status: TargetLearningStatus;
}
