import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamStructureType } from 'src/database/entities/examstructuretype.entity';
import { Repository } from 'typeorm';
import { CreateExamStructureTypeDto } from './dto/create-exam-structure-type.dto';

@Injectable()
export class ExamStructureTypeService {
    constructor(
        @InjectRepository(ExamStructureType)
        private readonly examStructureTypeRepository: Repository<ExamStructureType>,
    ) {}

    async save(createExamStructureTypeDto: CreateExamStructureTypeDto) {
        const { name, numberOfMath } = createExamStructureTypeDto;
        const nameExamStructureType =
            await this.examStructureTypeRepository.findOne({
                where: { name: name },
            });

        if (name) {
            throw new HttpException(
                'Name is already exsist',
                HttpStatus.BAD_REQUEST,
            );
        }

        const savedExamStructureType =
            await this.examStructureTypeRepository.create({
                ...createExamStructureTypeDto,
                numberOfMath: numberOfMath,
            });

        return await this.examStructureTypeRepository.save(
            savedExamStructureType,
        );
    }

    async get() {
        return await this.examStructureTypeRepository.find();
    }
}
