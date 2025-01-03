import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
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

    async update(updateExamScoreDetail: UpdateExamScoreDetailDto[]) {
        const updatedExamScoreDetails: ExamScoreDetail[] = [];

        for (const updateDto of updateExamScoreDetail) {
            const existingExamScoreDetail =
                await this.examScoreDetailRepository.findOne({
                    where: { id: updateDto.id },
                });

            if (!existingExamScoreDetail) {
                throw new NotFoundException(
                    `ExamScoreDetail with ID ${updateDto.id} not found`,
                );
            }

            if (updateDto.lowerscore === undefined) {
                throw new HttpException(
                    'Lowscore is undefined',
                    HttpStatus.BAD_REQUEST,
                );
            } else if (updateDto.upperscore === undefined) {
                throw new HttpException(
                    'Upper is undefined',
                    HttpStatus.BAD_REQUEST,
                );
            }

            Object.assign(existingExamScoreDetail, {
                lowerscore: updateDto.lowerscore,
                upperscore: updateDto.upperscore,
            });

            updatedExamScoreDetails.push(existingExamScoreDetail);
        }
        return this.examScoreDetailRepository.save(updatedExamScoreDetails);
    }

    async getScore(
        rawscore: number,
        sectionName: string,
        difficulty: string,
    ): Promise<number> {
        const scoreDetail = await this.examScoreDetailRepository.findOne({
            where: {
                rawscore: rawscore,
                section: { name: sectionName },
            },
            select: difficulty === 'Hard' ? ['upperscore'] : ['lowerscore'],
        });
        return difficulty === 'Hard'
            ? scoreDetail?.upperscore
            : scoreDetail?.lowerscore;
    }
}
