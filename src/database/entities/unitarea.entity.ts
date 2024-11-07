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
import { Unit } from './unit.entity';
import { Lesson } from './lesson.entity';
import { Skill } from './skill.entity';

@Entity('unitarea')
export class UnitArea {
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

    @ManyToOne(() => Unit, (unit) => unit.unitAreas)
    @JoinColumn({ name: 'unitid' })
    unit: Unit;

    @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'skillid' })
    skill: Skill;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    //OneToMany
    @OneToMany(() => Lesson, (lesson) => lesson.unitArea, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    lessons: Lesson[];
}
