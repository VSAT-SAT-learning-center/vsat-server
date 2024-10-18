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

@Entity('skill')
export class Skill {
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

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'boolean', default: true })
    status: boolean;
}
