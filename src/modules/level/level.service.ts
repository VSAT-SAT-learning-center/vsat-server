import { plainToInstance } from 'class-transformer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Level } from 'src/database/entities/level.entity';
import { Repository } from 'typeorm';
import { LevelDTO } from './dto/level.dto';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Injectable()
export class LevelService extends BaseService<Level> {
    constructor(
      @InjectRepository(Level)
      levelRepository: Repository<Level>,
      paginationService: PaginationService,
    ) {
      super(levelRepository, paginationService);
    }
  }
