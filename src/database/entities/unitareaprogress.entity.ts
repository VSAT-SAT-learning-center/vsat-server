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
import { UnitArea } from './unitarea.entity';
import { UnitProgress } from './unitprogress.entity';
import { ProgressStatus } from 'src/common/enums/progress-status.enum';
import { LessonProgress } from './lessonprogress.entity';

@Entity('unitareaprogress')
export class UnitAreaProgress {
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

    @ManyToOne(() => UnitArea)
    @JoinColumn({ name: 'unitareaid' })
    unitArea: UnitArea;

    @ManyToOne(() => UnitProgress)
    @JoinColumn({ name: 'unitprogressid' })
    unitProgress: UnitProgress;

    @Column({ type: 'int', nullable: true })
    progress: number;

    @Column({
        type: 'enum',
        enum: ProgressStatus,
        default: ProgressStatus.NOT_STARTED,
        nullable: true,
    })
    status: ProgressStatus;

    @OneToMany(
        () => LessonProgress,
        (lessonProgresses) => lessonProgresses.unitAreaProgress,
        { cascade: true },
    )
    lessonProgresses: LessonProgress[];
}
