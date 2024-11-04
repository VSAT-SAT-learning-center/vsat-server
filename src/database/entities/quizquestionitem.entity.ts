import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Quiz } from "./quiz.entity";
import { QuizQuestion } from "./quizquestion.entity";

@Entity('quizquestionitem')
export class QuizQuestionItem {
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

    @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quizid' })
    quiz: Quiz;

    @ManyToOne(() => QuizQuestion, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quizquestionid' })
    quizquestion: QuizQuestion;
}
