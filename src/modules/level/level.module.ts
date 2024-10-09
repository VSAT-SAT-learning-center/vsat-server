import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from 'src/database/entities/level.entity';
import { LevelController } from './level.controller';
import { LevelService } from './level.service';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Module({
    imports: [TypeOrmModule.forFeature([Level])],
    controllers: [LevelController],
    providers: [LevelService, PaginationService],
    exports: [LevelService],
})
export class LevelModule {}
