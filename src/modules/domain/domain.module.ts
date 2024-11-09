import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainService } from './domain.service';
import { DomainController } from './domain.controller';
import { Domain } from 'src/database/entities/domain.entity';
import { Section } from 'src/database/entities/section.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Domain, Section])],
    providers: [DomainService],
    controllers: [DomainController],
    exports: [DomainService]
})
export class DomainModule {}
