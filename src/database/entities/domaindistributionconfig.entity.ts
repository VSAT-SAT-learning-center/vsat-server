import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Domain } from './domain.entity';
import { ExamSemester } from './examsemeseter.entity';

@Entity('domaindistributionconfig')
export class DomainDistributionConfig {
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
    title: string;

    @Column({ type: 'int' })
    minQuestion: number;

    @Column({ type: 'int' })
    maxQuestion: number;

    @Column({ type: 'int' })
    percent: number;

    @ManyToOne(() => Domain, (domain) => domain.domainDistributionConfigs)
    domain: Domain;

    @ManyToOne(
        () => ExamSemester,
        (examSemester) => examSemester.domainDistributionConfigs,
    )
    examSemester: ExamSemester;
}
