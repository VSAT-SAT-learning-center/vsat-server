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
import { DomainDistributionConfig } from './domaindistributionconfig.entity';
import { Unit } from './unit.entity'; // Import Unit entity
import { Skill } from './skill.entity';

@Entity('domain')
export class Domain {
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

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @OneToMany(() => Unit, (unit) => unit.domain)
  units: Unit[];

  @OneToMany(() => Skill, (skill) => skill.domain)
  skills: Skill[];

  @OneToMany(() => DomainDistributionConfig, (config) => config.domain)
  domainDistributionConfigs: DomainDistributionConfig[];
}
