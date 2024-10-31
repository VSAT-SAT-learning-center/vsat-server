import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamScore } from 'src/database/entities/examscore.entity';
import { Repository } from 'typeorm';
import { CreateExamScoreDto } from './dto/create-examscore.dto';
import { ExamScoreDetailService } from '../exam-score-detail/exam-score-detail.service';
@Injectable()
export class ExamScoreService {
    constructor(
        @InjectRepository(ExamScore)
        private readonly repository: Repository<ExamScore>,

        private readonly examScoreDetailService: ExamScoreDetailService,
    ) {}

    async create(
        createExamScoreDto: CreateExamScoreDto,
    ): Promise<CreateExamScoreDto> {
        const type = await this.repository.findOne({
            where: { type: createExamScoreDto.type },
        });

        const title = await this.repository.findOne({
            where: { title: createExamScoreDto.title },
        });

        if (type) {
            throw new HttpException(
                'Type is already esxist',
                HttpStatus.BAD_REQUEST,
            );
        }

        if (title) {
            throw new HttpException(
                'Title is already esxist',
                HttpStatus.BAD_REQUEST,
            );
        }
        const saveExamScore = await this.repository.create({
            type: createExamScoreDto.type,
            title: createExamScoreDto.title,
        });

        await this.repository.save(saveExamScore);

        await this.examScoreDetailService.createMany(
            createExamScoreDto.createExamScoreDetail,
            saveExamScore.id,
        );

        return createExamScoreDto;
    }
}
