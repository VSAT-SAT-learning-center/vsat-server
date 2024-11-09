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
import { ExamStructure } from './examstructure.entity';
import { ExamType } from './examtype.entity';
import { ExamQuestion } from './examquestion.entity';
import { ExamStatus } from 'src/common/enums/exam-status.enum';

@Entity('exam')
export class Exam {
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

    @ManyToOne(() => ExamStructure)
    @JoinColumn({ name: 'examstructureid' })
    examStructure: ExamStructure;

    @ManyToOne(() => ExamType)
    @JoinColumn({ name: 'examtypeid' })
    examType: ExamType;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: ExamStatus,
        default: ExamStatus.PENDING,
    })
    status: ExamStatus;

    @OneToMany(() => ExamQuestion, (examQuestion) => examQuestion.exam)
    examquestion: ExamQuestion[];
}
