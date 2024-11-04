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
import { ExamAttemptService } from '../exam-attempt/exam-attempt.service';
import { ExamAttemptDetailService } from '../exam-attempt-detail/exam-attempt-detail.service';
import { ModuleTypeService } from '../module-type/module-type.service';
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

        private readonly examAttemptService: ExamAttemptService,
        private readonly examAttemptDetailService: ExamAttemptDetailService,
        private readonly moduleTypeService: ModuleTypeService,
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
            relations: ['examScoreDetails', 'examScoreDetails.section'],
            order: {
                createdat: 'DESC',
                examScoreDetails: {
                    rawscore: 'ASC',
                },
            },
        });

        const totalPages = Math.ceil(total / pageSize);
        return {
            examScore,
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
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
            relations: ['examScoreDetails'],
        });
    }

    async calculateScore(examAttemptId: string) {
        // Bước 1: Xác định độ khó của Module 2 cho từng phần
        const module2DifficultyRW = await this.moduleTypeService.getModuleDifficulty(examAttemptId, 'Reading & Writing');
        const module2DifficultyMath = await this.moduleTypeService.getModuleDifficulty(examAttemptId, 'Math');
    
        // Bước 2: Tính tổng số câu đúng cho từng phần
        const rawscoreRW = await this.examAttemptDetailService.countCorrectAnswers(examAttemptId, 'Reading & Writing');
        const rawscoreMath = await this.examAttemptDetailService.countCorrectAnswers(examAttemptId, 'Math');
    
        // Bước 3: Lấy điểm từ ExamScoreDetail
        const finalScoreRW = await this.examScoreDetailService.getScore(rawscoreRW, 'Reading & Writing', module2DifficultyRW);
        const finalScoreMath = await this.examScoreDetailService.getScore(rawscoreMath, 'Math', module2DifficultyMath);
    
        // Bước 4: Cập nhật điểm trong ExamAttempt
        await this.examAttemptService.updateScore(examAttemptId, finalScoreRW, finalScoreMath);
      }
}
