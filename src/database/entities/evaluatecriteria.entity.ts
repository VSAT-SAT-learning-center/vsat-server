import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('evaluatecriteria')
export class EvaluateCriteria {
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

    @Column({ type: 'text', nullable: true })
    description?: string; 

    @Column({ type: 'enum', enum: ['Student', 'Teacher'] })
    applicableTo: 'Student' | 'Teacher';
}
