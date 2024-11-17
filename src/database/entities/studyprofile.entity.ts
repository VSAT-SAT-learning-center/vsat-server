import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { StudyProfileStatus } from 'src/common/enums/study-profile-status.enum';

@Entity('studyprofile')
export class StudyProfile {
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

    @ManyToOne(() => Account)
    @JoinColumn({ name: 'accountid' })
    account: Account;

    @Column({ type: 'int', nullable: true })
    targetscoreMath: number;

    @Column({ type: 'int', nullable: true })
    targetscoreRW: number;

    @Column({ type: 'timestamp', nullable: true })
    startdate: Date;

    @Column({ type: 'timestamp', nullable: true })
    enddate: Date;

    @Column({
        type: 'enum',
        enum: StudyProfileStatus,
        default: StudyProfileStatus.INACTIVE,
    })
    status: StudyProfileStatus;
}
