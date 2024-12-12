import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EvaluateCriteria } from "./evaluatecriteria.entity";
import { EvaluateFeedback } from "./evaluatefeedback.entity";

@Entity('feedbackcriteriascores')
export class FeedbackCriteriaScores {
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

    @ManyToOne(() => EvaluateFeedback, { nullable: false })
    @JoinColumn({ name: 'feedbackid' })
    feedback: EvaluateFeedback; 

    @ManyToOne(() => EvaluateCriteria, { nullable: false })
    @JoinColumn({ name: 'criteriaid' })
    criteria: EvaluateCriteria; 

    @Column({ type: 'int', nullable: false })
    score: number; 
}
