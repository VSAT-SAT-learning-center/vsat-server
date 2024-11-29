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
import { StudyProfile } from './studyprofile.entity';

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
    accountFrom: Account; 

    @ManyToOne(() => Account, { nullable: false })
    @JoinColumn({ name: 'accounttoid' })
    accountTo: Account; 

    @ManyToOne(() => Account, { nullable: true })
    @JoinColumn({ name: 'accountreviewid' })
    accountReview: Account; 

    @ManyToOne(() => StudyProfile, { nullable: true })
    @JoinColumn({ name: 'studyprofileid' })
    studyProfileid: StudyProfile;

    @Column({ type: 'enum', enum: EvaluateFeedbackType })
    evaluateFeedbackType: EvaluateFeedbackType; 

    @Column({ type: 'text', nullable: true })
    narrativeFeedback?: string; 

    @Column({ type: 'boolean', default: false })
    isEscalated: boolean; 

    @OneToMany(() => FeedbackCriteriaScores, (score) => score.feedback, { eager: true })
    criteriaScores: FeedbackCriteriaScores[];
}
