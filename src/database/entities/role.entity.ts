import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', nullable: true })
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'varchar', length: 100 })
  roleName: string;

  @Column({ type: 'boolean', nullable: true })
  status: boolean;

  @OneToMany(() => Account, (account) => account.role)
  accounts: Account[];
}
