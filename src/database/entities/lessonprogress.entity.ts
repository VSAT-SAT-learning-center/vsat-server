import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { UnitAreaProgress } from './unitareaprogress.entity';
import { Lesson } from './lesson.entity';
import { ProgressStatus } from 'src/common/enums/progress-status.enum';
import { TargetLearningDetail } from './targetlearningdetail.entity';

@Entity('lessonprogress')
export class LessonProgress {
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

    @ManyToOne(() => UnitAreaProgress)
    @JoinColumn({ name: 'unitareaprogressid' })
    unitAreaProgress: UnitAreaProgress;

    @ManyToOne(() => TargetLearningDetail)
    @JoinColumn({ name: 'targetlearningdetailid' })
    targetLearning: TargetLearningDetail;

    @ManyToOne(() => Lesson)
    @JoinColumn({ name: 'lessonid' })
    lesson: Lesson;

    @Column({ type: 'int', nullable: true })
    progress: number;

    @Column({
        type: 'enum',
        enum: ProgressStatus,
        default: ProgressStatus.NOT_STARTED,
        nullable: true,
    })
    status: ProgressStatus;
}
