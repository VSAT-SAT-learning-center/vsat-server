import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { UnitArea } from './unitarea.entity';
import { UnitProgress } from './unitprogress.entity';

@Entity('unitareaprogress')
export class UnitAreaProgress {
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

    @ManyToOne(() => UnitArea)
    @JoinColumn({ name: 'unitareaid' })
    unitArea: UnitArea;

    @ManyToOne(() => UnitProgress)
    @JoinColumn({ name: 'unitprogressid' })
    unitProgress: UnitProgress;

    @Column({ type: 'int', nullable: true })
    progress: number;

    @Column({ type: 'varchar', length: 20, nullable: true })
    status: string;
}
