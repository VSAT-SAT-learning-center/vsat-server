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
import { Level } from './level.entity';
import { Section } from './section.entity';
import { StudyProfile } from './studyprofile.entity';
import { UnitProgress } from './unitprogress.entity';
import { TargetLearning } from './targetlearning.entity';

@Entity('targetlearningdetail')
export class TargetLearningDetail {
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

    @ManyToOne(() => Section)
    @JoinColumn({ name: 'sectionid' })
    section: Section;

    @ManyToOne(() => TargetLearning)
    @JoinColumn({ name: 'targetlearningid' })
    targetlearning: TargetLearning;

    @OneToMany(() => UnitProgress, (unitprogress) => unitprogress.targetLearningDetail)
    unitprogress: UnitProgress[];

    @Column({ type: 'boolean', default: true })
    status: boolean;
}