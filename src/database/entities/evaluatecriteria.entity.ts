import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('evaluatecriteria')
export class EvaluateCriteria {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string; // Criterion name (e.g., Academic Performance)

    @Column({ type: 'text', nullable: true })
    description?: string; // Optional description of the criterion

    @Column({ type: 'enum', enum: ['Student', 'Teacher'] })
    applicableTo: 'Student' | 'Teacher';
}
