import { SectionDTO } from './dto/section.dto';
import { Section } from '../../database/entities/section.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SectionService {
    constructor(
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
    ) {}

    //save
    async save(sectionDto: SectionDTO, userId: string): Promise<SectionDTO> {
        if (!sectionDto.id) {
            sectionDto.createdby = userId;
        }

        sectionDto.updatedby = userId;
        const section = await this.sectionRepository.save(sectionDto);

        console.log(section);

        if (!section) {
            throw new HttpException(
                'Failed to save section',
                HttpStatus.BAD_REQUEST,
            );
        }

        return plainToInstance(SectionDTO, section, {
            excludeExtraneousValues: true,
        });
    }

    //update
    async update(
        id: string,
        sectionDto: SectionDTO,
        userId: string,
    ): Promise<SectionDTO> {
        if (!sectionDto.id) {
            sectionDto.createdby = userId;
        }

        sectionDto.updatedby = userId;
        const sectionId = await this.sectionRepository.findOneBy({ id });

        if (!sectionId) {
            throw new HttpException('Section not found', HttpStatus.NOT_FOUND);
        }

        await this.sectionRepository.update(id, sectionDto);

        const updatedSection = await this.sectionRepository.findOneBy({ id });

        return plainToInstance(SectionDTO, updatedSection, {
            excludeExtraneousValues: true,
        });
    }

    //find
    async find(): Promise<SectionDTO[]> {
        const sections = await this.sectionRepository.find();
        return plainToInstance(SectionDTO, sections, {
            excludeExtraneousValues: true,
        });
    }

    //findOneById
    async findOneById(id: string): Promise<SectionDTO> {
        const section = await this.sectionRepository.findOneBy({ id });

        if (!section) {
            throw new HttpException('Seciton not found', HttpStatus.NOT_FOUND);
        }
        return plainToInstance(SectionDTO, section, {
            excludeExtraneousValues: true,
        });
    }
}
