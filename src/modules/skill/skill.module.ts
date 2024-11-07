import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillService } from './skill.service';
import { SkillController } from './skill.controller';
import { Domain } from 'domain';
import { Skill } from 'src/database/entities/skill.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([Skill, Domain])],
  providers: [SkillService, PaginationService],
  controllers: [SkillController],
  exports: [SkillService],
})
export class SkillModule {}
