import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { FeedbackEventType } from 'src/common/enums/feedback-event-type.enum';

@Entity('notification')
export class Notification {
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

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'json', nullable: true })
    data: any;

    @ManyToOne(() => Account, { nullable: false })
    @JoinColumn({ name: 'accountFromId' })
    accountFrom: Account;

    @ManyToOne(() => Account, { nullable: false })
    @JoinColumn({ name: 'accountToId' })
    accountTo: Account;

    @Column({ type: 'boolean', default: false })
    isRead: boolean;

    @Column({ type: 'enum', enum: FeedbackEventType, default: FeedbackEventType.UNKNOWN })
    type: FeedbackEventType;
}
