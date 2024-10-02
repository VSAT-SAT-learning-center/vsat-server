import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudyProfileDto } from './dto/create-studyprofile.dto';
import { UpdateStudyProfileDto } from './dto/update-studyprofile.dto';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class StudyProfileService {
  constructor(
    @InjectRepository(StudyProfile)
    private readonly studyProfileRepository: Repository<StudyProfile>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const studyProfiles = await this.studyProfileRepository.find({
      relations: ['account'],
    });

    const sortedStudyProfiles = this.paginationService.sort(studyProfiles, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedStudyProfiles,
      page,
      pageSize,
    );

    return {
      data,
      totalItems,
      totalPages,
    };
  }

  async findOne(id: string) {
    return await this.studyProfileRepository.findOne({ 
      where: { id },
      relations: ['account'] });
  }

  async create(createStudyProfileDto: CreateStudyProfileDto) {
    const studyProfile = this.studyProfileRepository.create(createStudyProfileDto);
    return await this.studyProfileRepository.save(studyProfile);
  }

  async update(id: string, updateStudyProfileDto: UpdateStudyProfileDto) {
    await this.studyProfileRepository.update(id, updateStudyProfileDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.studyProfileRepository.delete(id);
    return { deleted: true };
  }
}
