import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateExamScoreDetailDto } from './dto/create-examscoredetail.dto';
import { ExamScoreDetail } from 'src/database/entities/examscoredetail.entity';
import { Section } from 'src/database/entities/section.entity';
import { ExamScore } from 'src/database/entities/examscore.entity';
import { UpdateExamScoreDetailDto } from './dto/update-examscoredetail.dto';

@Injectable()
export class ExamScoreDetailService {
    constructor(
        @InjectRepository(ExamScoreDetail)
        private readonly examScoreDetailRepository: Repository<ExamScoreDetail>,
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
    ) {}

    async createMany(
        createExamScoreDetailsDto: CreateExamScoreDetailDto[],
        examScoreId: string,
    ): Promise<ExamScoreDetail[]> {
        const sectionNames = createExamScoreDetailsDto.map(
            (dto) => dto.section,
        );
        const sections = await this.sectionRepository.find({
            where: { name: In(sectionNames) },
        });

        const sectionMap = new Map(
            sections.map((section) => [section.name, section]),
        );

        const createdExamScoreDetails = createExamScoreDetailsDto.map((dto) => {
            const section = sectionMap.get(dto.section);

            if (!section) {
                throw new NotFoundException(`Section ${dto.section} not found`);
            }

            return this.examScoreDetailRepository.create({
                ...dto,
                section,
                examScore: { id: examScoreId } as ExamScore,
            });
        });

        return this.examScoreDetailRepository.save(createdExamScoreDetails);
    }

    async update(id: string, updateExamScoreDetail: UpdateExamScoreDetailDto) {
        const examScoreDetail = await this.examScoreDetailRepository.findOne({
            where: { id: id },
        });

        if (!examScoreDetail) {
            throw new NotFoundException(
                `ExamScoreDetail with ID ${id} not found`,
            );
        }
    }
}
