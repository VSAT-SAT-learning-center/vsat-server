import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Domain } from './domain.entity';
import { ModuleType } from './moduletype.entity';

@Entity('domaindistribution')
export class DomainDistribution {
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

    @ManyToOne(() => Domain)
    @JoinColumn({ name: 'domainid' })
    domain: Domain;

    @ManyToOne(() => ModuleType)
    @JoinColumn({ name: 'moduletypeid' })
    moduleType: ModuleType;

    @Column({ type: 'int', nullable: true })
    numberofquestion: number;
}
