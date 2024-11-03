import { GetExamScoreDto } from './dto/get-examscore.dto';
import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamScore } from 'src/database/entities/examscore.entity';
import { Repository } from 'typeorm';
import { CreateExamScoreDto } from './dto/create-examscore.dto';
import { ExamScoreDetailService } from '../exam-score-detail/exam-score-detail.service';
import { plainToInstance } from 'class-transformer';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamStructureType } from 'src/database/entities/examstructuretype.entity';
import { log } from 'console';
@Injectable()
export class ExamScoreService {
    constructor(
        @InjectRepository(ExamScore)
        private readonly examScoreRepository: Repository<ExamScore>,
        @InjectRepository(ExamStructure)
        private readonly examStructureRepository: Repository<ExamStructure>,
        @InjectRepository(ExamStructureType)
        private readonly examStructureTypeRepository: Repository<ExamStructureType>,

        private readonly examScoreDetailService: ExamScoreDetailService,
    ) {}

    async create(
        createExamScoreDto: CreateExamScoreDto,
    ): Promise<CreateExamScoreDto> {
        const examStructureType =
            await this.examStructureTypeRepository.findOne({
                where: { name: createExamScoreDto.type },
            });

        const saveExamScore = await this.examScoreRepository.create({
            title: createExamScoreDto.title,
            examStructureType: examStructureType,
        });

        await this.examScoreRepository.save(saveExamScore);

        await this.examScoreDetailService.createMany(
            createExamScoreDto.createExamScoreDetail,
            saveExamScore.id,
        );

        return createExamScoreDto;
    }

    async getAllExamScoreWithDetails(
        page: number,
        pageSize: number,
    ): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [examScore, total] = await this.examScoreRepository.findAndCount({
            skip: skip,
            take: pageSize,
            relations: [
                'examScoreDetails',
                'examScoreDetails.section',
                'examStructureType',
            ],
            order: {
                createdat: 'DESC',
                examScoreDetails: {
                    rawscore: 'ASC',
                },
            },
        });

        return {
            data: examScore,
            total,
        };
    }

    async getExamScoreWithExamStructureType(getExamScoreDto: GetExamScoreDto) {
        const examStructureType =
            await this.examStructureTypeRepository.findOne({
                where: { name: getExamScoreDto.name },
            });

        return await this.examScoreRepository.find({
            where: {
                examStructureType: {
                    id: examStructureType.id,
                },
            },
            relations: ['examScoreDetails', 'examScoreDetails.section'],
            order: {
                examScoreDetails: {
                    rawscore: 'ASC',
                },
            },
        });
    }
}
