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
import { Account } from './account.entity';
import { EvaluateFeedbackType } from 'src/common/enums/evaluate-feedback-type.enum';
import { FeedbackCriteriaScores } from './feedbackcriteriascores.entity';

@Entity('evaluatefeedback')
export class EvaluateFeedback {
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

    @ManyToOne(() => Account, { nullable: false })
    @JoinColumn({ name: 'accountfromid' })
    accountFrom: Account; // Feedback giver

    @ManyToOne(() => Account, { nullable: false })
    @JoinColumn({ name: 'accounttoid' })
    accountTo: Account; // Feedback recipient

    @ManyToOne(() => Account, { nullable: true })
    @JoinColumn({ name: 'accountreviewid' })
    accountReview: Account; // Optional reviewer (e.g., Staff)

    @Column({ type: 'enum', enum: EvaluateFeedbackType })
    evaluateFeedbackType: EvaluateFeedbackType; // Feedback type

    @Column({ type: 'text', nullable: true })
    narrativeFeedback?: string; // General narrative feedback

    @Column({ type: 'boolean', default: false })
    isEscalated: boolean; // Indicates if feedback has been escalated

    @OneToMany(() => FeedbackCriteriaScores, (score) => score.feedback, { eager: true })
    criteriaScores: FeedbackCriteriaScores[];
}
