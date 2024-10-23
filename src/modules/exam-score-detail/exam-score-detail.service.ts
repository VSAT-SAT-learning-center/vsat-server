import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamScoreDetailDto } from './dto/create-examscoredetail.dto';
import { UpdateExamScoreDetailDto } from './dto/update-examscoredetail.dto';
import { ExamScoreDetail } from 'src/database/entities/examscoredetail.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { ExamScore } from 'src/database/entities/examscore.entity';
import { Section } from 'src/database/entities/section.entity';

@Injectable()
export class ExamScoreDetailService extends BaseService<ExamScoreDetail> {
    constructor(
        @InjectRepository(ExamScoreDetail)
        private readonly examScoreDetailRepository: Repository<ExamScoreDetail>,
        @InjectRepository(ExamScore)
        private readonly examScoreRepository: Repository<ExamScore>,
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
        paginationService: PaginationService,
    ) {
        super(examScoreDetailRepository, paginationService);
    }

    async createMany(
        createExamScoreDetailsDto: CreateExamScoreDetailDto[],
    ): Promise<ExamScoreDetail[]> {
        const createdExamScoreDetails: ExamScoreDetail[] = [];

        for (const dto of createExamScoreDetailsDto) {
            const examScore = await this.examScoreRepository.findOne({
                where: { id: dto.examScoreId },
            });

            const section = await this.sectionRepository.findOne({
                where: { id: dto.sectionId },
            });

            if (!section) {
                throw new NotFoundException(
                    `Section with id ${dto.sectionId} not found`,
                );
            }

            if (!examScore) {
                throw new NotFoundException(
                    `ExamScore with id ${dto.examScoreId} not found`,
                );
            }

            const newExamScoreDetail = this.repository.create({
                ...dto,
                examScore,
                section,
            });

            createdExamScoreDetails.push(newExamScoreDetail);
        }

        return this.repository.save(createdExamScoreDetails);
    }
}
