import { plainToInstance } from 'class-transformer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Level } from 'src/database/entities/level.entity';
import { Repository } from 'typeorm';
import { BaseService } from '../base/base.service';
import { GetLevelDTO } from './dto/get-level.dto';

@Injectable()
export class LevelService extends BaseService<Level> {
    constructor(
        @InjectRepository(Level)
        private readonly levelRepository: Repository<Level>,
    ) {
        super(levelRepository);
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
    async updateLevel(
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

    async getAll(): Promise<GetLevelDTO[]> {
        try {
            // Fetch data từ repository
            const level = await this.levelRepository.find();

            return plainToInstance(GetLevelDTO, level, {
                excludeExtraneousValues: true,
            });
        } catch (error) {
            console.error('Log Error:', error);
            throw new HttpException(
                'Failed to retrieve data',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
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
