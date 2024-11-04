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
import { Section } from './section.entity';
import { Level } from './level.entity';
import { UnitArea } from './unitarea.entity';
import { Feedback } from './feedback.entity';
import { UnitStatus } from 'src/common/enums/unit-status.enum';
import { Domain } from './domain.entity';

@Entity('unit')
export class Unit {
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

    @ManyToOne(() => Section)
    @JoinColumn({ name: 'sectionid' })
    section: Section;

    @ManyToOne(() => Level)
    @JoinColumn({ name: 'levelid' })
    level: Level;

    @ManyToOne(() => Domain)
    @JoinColumn({ name: 'domainid' })
    domain: Domain;

    @Column({ type: 'varchar', length: 100 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'enum', enum: UnitStatus, default: UnitStatus.DRAFT })
    status: UnitStatus;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'int', nullable: true })
    countfeedback: number;

    @ManyToOne(() => Domain, (domain) => domain.units)
    @JoinColumn({ name: 'domainid' })
    domain: Domain;

    @OneToMany(() => UnitArea, (unitArea) => unitArea.unit, { cascade: true })
    unitAreas: UnitArea[];

    @OneToMany(() => Feedback, (feedback) => feedback.unit)
    feedbacks: Feedback[];
}
