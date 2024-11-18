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

    @UpdateDateColumn({ type: 'timestamp' })
    startdate: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    enddate: Date;

    @OneToOne(() => ExamAttempt, (examattempt) => examattempt.targetlearning)
    examattempt: ExamAttempt[];

    @ManyToOne(() => StudyProfile)
    @JoinColumn({ name: 'studyprofileid' })
    studyProfile: StudyProfile;

    @OneToMany(
        () => TargetLearningDetail,
        (targetlearningdetail) => targetlearningdetail.targetlearning,
    )
    targetlearningdetail: TargetLearningDetail[];

    @Column({ type: 'boolean', default: true })
    status: boolean;
}
