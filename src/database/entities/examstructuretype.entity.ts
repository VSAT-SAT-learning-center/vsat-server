import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { ExamStructure } from './examstructure.entity';

@Entity('examstructuretype')
export class ExamStructureType {
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

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column('int')
    numberOfReadWrite: number;

    @Column('int')
    numberOfMath: number;

    @OneToMany(() => ExamStructure, (examStructure) => examStructure.examStructureType)
    examStructures: ExamStructure[];
}
