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
@Injectable()
export class ExamScoreService {
    constructor(
        @InjectRepository(ExamScore)
        private readonly examScoreRepository: Repository<ExamScore>,

        private readonly examScoreDetailService: ExamScoreDetailService,
    ) {}

    async create(
        createExamScoreDto: CreateExamScoreDto,
    ): Promise<CreateExamScoreDto> {
        const title = await this.examScoreRepository.findOne({
            where: { title: createExamScoreDto.title },
        });

        if (title) {
            throw new HttpException(
                'Title is already esxist',
                HttpStatus.BAD_REQUEST,
            );
        }
        const saveExamScore = await this.examScoreRepository.create({
            type: createExamScoreDto.type,
            title: createExamScoreDto.title,
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
            relations: ['examScoreDetails'],
        });

        const totalPages = Math.ceil(total / pageSize);
        return {
            examScore,
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }
}
