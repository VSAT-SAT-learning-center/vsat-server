import { plainToInstance } from 'class-transformer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Level } from 'src/database/entities/level.entity';
import { Repository } from 'typeorm';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { GetLevelDTO } from './dto/get-level.dto';

@Injectable()
export class LevelService extends BaseService<Level> {
    constructor(
      @InjectRepository(Level)
      private readonly levelRepository: Repository<Level>,
      paginationService: PaginationService,
    ) {
      super(levelRepository, paginationService);
    }

    //save
    async save(levelDto: GetLevelDTO, userId: string): Promise<GetLevelDTO> {
        if (!levelDto.id) {
            levelDto.createdby = userId;
        }

        levelDto.updatedby = userId;

        const saveLevel = await this.levelRepository.save(levelDto);

        if (!saveLevel) {
            throw new HttpException(
                'Fail to save level',
                HttpStatus.BAD_REQUEST,
            );
        }

        return plainToInstance(GetLevelDTO, saveLevel, {
            excludeExtraneousValues: true,
        });
    }

    //update
    async updateUnit(
        id: string,
        levelDto: GetLevelDTO,
        userId: string,
    ): Promise<GetLevelDTO> {
        if (!levelDto.id) {
            levelDto.createdby = userId;
        }

        levelDto.updatedby = userId;
        const level = await this.levelRepository.findOneBy({ id });

        if (!level) {
            throw new HttpException('Level not found', HttpStatus.NOT_FOUND);
        }

        await this.levelRepository.update(id, levelDto);

        const levelUpdated = this.levelRepository.findOneBy({ id });

        return plainToInstance(GetLevelDTO, levelUpdated, {
            excludeExtraneousValues: true,
        });
    }

    //find
    async find(): Promise<GetLevelDTO> {
        return plainToInstance(GetLevelDTO, this.levelRepository.find(), {
            excludeExtraneousValues: true,
        });
    }

    //findById
    async findById(id: string): Promise<GetLevelDTO> {
        const level = await this.levelRepository.findOneBy({ id });

        if (!level) {
            throw new HttpException('Level not found', HttpStatus.NOT_FOUND);
        }

        return plainToInstance(GetLevelDTO, level, {
            excludeExtraneousValues: true,
        });
    }
}
