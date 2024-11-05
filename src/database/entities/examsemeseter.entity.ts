import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ExamStructure } from './examstructure.entity';
import { DomainDistributionConfig } from './domaindistributionconfig.entity';

@Entity('examsemester')
export class ExamSemester {
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

    @Column({ type: 'date', nullable: true })
    datefrom: Date;
    
    @Column({ type: 'date', nullable: true })
    dateto: Date;

    //One to many
    @OneToMany(
        () => ExamStructure,
        (examStructure) => examStructure.examSemester,
    )
    examStructures: ExamStructure[];

    @OneToMany(() => DomainDistributionConfig, (config) => config.examSemester)
    domainDistributionConfigs: DomainDistributionConfig[];
}
