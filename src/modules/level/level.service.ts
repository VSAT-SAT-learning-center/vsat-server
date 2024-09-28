import { plainToInstance } from 'class-transformer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Level } from 'src/database/entities/level.entity';
import { Repository } from 'typeorm';
import { LevelDTO } from './dto/level.dto';

@Injectable()
export class LevelService {
    constructor(
        @InjectRepository(Level)
        private readonly levelRepository: Repository<Level>,
    ) {}

    //save
    async save(levelDto: LevelDTO): Promise<LevelDTO> {
        const saveLevel = await this.levelRepository.save(levelDto);

        if (!saveLevel) {
            throw new HttpException(
                'Fail to save level',
                HttpStatus.BAD_REQUEST,
            );
        }

        return plainToInstance(LevelDTO, saveLevel, {
            excludeExtraneousValues: true,
        });
    }

    //update
    async update(id: string, levelDto: LevelDTO): Promise<LevelDTO> {
        const level = await this.levelRepository.findOneBy({ id });

        if (!level) {
            throw new HttpException('Level not found', HttpStatus.NOT_FOUND);
        }

        await this.levelRepository.update(id, levelDto);

        const levelUpdated = this.levelRepository.findOneBy({ id });

        return plainToInstance(LevelDTO, levelUpdated, {
            excludeExtraneousValues: true,
        });
    }

    //find
    async find(): Promise<LevelDTO> {
        return plainToInstance(LevelDTO, this.levelRepository.find(), {
            excludeExtraneousValues: true,
        });
    }

    //findById
    async findById(id: string): Promise<LevelDTO> {
        const level = await this.levelRepository.findOneBy({ id });

        if (!level) {
            throw new HttpException('Level not found', HttpStatus.NOT_FOUND);
        }

        return plainToInstance(LevelDTO, level, {
            excludeExtraneousValues: true,
        });
    }
}
