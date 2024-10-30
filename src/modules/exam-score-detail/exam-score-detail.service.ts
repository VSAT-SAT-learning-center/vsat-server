import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamScoreDetailDto } from './dto/create-examscoredetail.dto';
import { UpdateExamScoreDetailDto } from './dto/update-examscoredetail.dto';
import { ExamScoreDetail } from 'src/database/entities/examscoredetail.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { Section } from 'src/database/entities/section.entity';

@Injectable()
export class ExamScoreDetailService extends BaseService<ExamScoreDetail> {
    constructor(
        @InjectRepository(ExamScoreDetail)
        private readonly examScoreDetailRepository: Repository<ExamScoreDetail>,
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
            const section = await this.sectionRepository.findOne({
                where: { id: dto.sectionId },
            });

            if (!section) {
                throw new NotFoundException(
                    `Section with id ${dto.sectionId} not found`,
                );
            }


            const newExamScoreDetail = this.repository.create({
                ...dto,
                section,
            });

            createdExamScoreDetails.push(newExamScoreDetail);
        }

        return this.repository.save(createdExamScoreDetails);
    }
}
