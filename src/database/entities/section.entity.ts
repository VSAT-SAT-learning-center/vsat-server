import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ModuleType } from './moduletype.entity';
import { Question } from './question.entity'; // Import Question entity
import { QuizQuestion } from './quizquestion.entity';

@Entity('section')
export class Section {
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

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @OneToMany(() => ModuleType, (moduletype) => moduletype.section)
    moduletype: ModuleType[];

    @OneToMany(() => Question, (question) => question.section)
    questions: Question[];

    @OneToMany(() => QuizQuestion, (quizquestion) => quizquestion.section)
    quizquestion: QuizQuestion[];
}
