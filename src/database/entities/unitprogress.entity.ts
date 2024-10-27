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
import { StudyProfile } from './studyprofile.entity';
import { Unit } from './unit.entity';
import { UnitAreaProgress } from './unitareaprogress.entity';
import { ProgressStatus } from 'src/common/enums/progress-status.enum';
import { TargetLearning } from './targetlearning.entity';

@Entity('unitprogress')
export class UnitProgress {
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

    @ManyToOne(() => TargetLearning)
    @JoinColumn({ name: 'targetlearningid' })
    targetLearning: TargetLearning;

    @ManyToOne(() => Unit)
    @JoinColumn({ name: 'unitid' })
    unit: Unit;

    @Column({ type: 'int', nullable: true })
    progress: number;

    @Column({
        type: 'enum',
        enum: ProgressStatus,
        default: ProgressStatus.NOT_STARTED,
        nullable: true,
    })
    status: ProgressStatus;

    // One-to-many relationship
    @OneToMany(
        () => UnitAreaProgress,
        (unitAreaProgress) => unitAreaProgress.unitProgress,
        { cascade: true },
    )
    unitAreaProgresses: UnitAreaProgress[];
}
