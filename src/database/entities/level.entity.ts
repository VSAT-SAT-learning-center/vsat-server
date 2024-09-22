import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('level')
export class Level {
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

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}
