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
import { Role } from './role.entity';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { StudyProfile } from './studyprofile.entity';

@Entity('account')
export class Account {
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

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'roleid' })
    role: Role;

    @Column({ type: 'varchar', length: 100 })
    username: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'varchar', length: 100 })
    firstname: string;

    @Column({ type: 'varchar', length: 100 })
    lastname: string;

    @Column({ type: 'boolean', nullable: true })
    gender: boolean;

    @Column({ type: 'date', nullable: true })
    dateofbirth: Date;

    @Column({ type: 'varchar', length: 15, nullable: true })
    phonenumber: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    profilepictureurl: string;

    @Column({ type: 'boolean', default: false })
    isTrialExam: boolean;

    @Column({
        type: 'enum',
        enum: AccountStatus,
    })
    status: AccountStatus;

    @Column({ type: 'varchar', length: 500, nullable: true })
    refreshToken: string;

    @OneToMany(
        () => StudyProfile,
        (studyProfile) => studyProfile.account,
    )
    studyProfiles: StudyProfile [];
}
