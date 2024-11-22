import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { CreateUnitAreaDto } from './dto/create-unitarea.dto';
import { UpdateUnitAreaDto } from './dto/update-unitarea.dto';
import { BaseService } from '../base/base.service';
import { UnitService } from '../unit/unit.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { LessonService } from '../lesson/lesson.service';
import { CreateLearningMaterialDto } from './dto/create-learningmaterial.dto';
import { UnitAreaResponseDto } from './dto/get-unitarea.dto';
import { UpdateUnitAreaStatusDto } from './dto/update-status-unitarea.dto';
import { Skill } from 'src/database/entities/skill.entity';

@Injectable()
export class UnitAreaService extends BaseService<UnitArea> {
    constructor(
        @InjectRepository(UnitArea)
        private readonly unitAreaRepository: Repository<UnitArea>,

        @Inject(forwardRef(() => UnitService))
        private readonly unitService: UnitService,

        @Inject(forwardRef(() => LessonService))
        private readonly lessonService: LessonService,
    ) {
        super(unitAreaRepository);
    }

    async createOrUpdateUnitAreas(
        createUnitAreaDtoList: CreateLearningMaterialDto[],
    ): Promise<UnitArea[]> {
        const createdOrUpdatedUnitAreas: UnitArea[] = [];

        const { unitId } = createUnitAreaDtoList[0];

        // Lấy danh sách tất cả các UnitArea hiện có của Unit
        const existingUnitAreas = await this.unitAreaRepository.find({
            where: { unit: { id: unitId } },
            relations: ['lessons'], // Load cả các lesson liên quan
        });

        // Lưu giữ các unitAreaId hiện tại để theo dõi xóa các bản ghi không còn tồn tại
        const unitAreaIdsInRequest = createUnitAreaDtoList.map((unitArea) => unitArea.id);

        // Xử lý từng UnitArea trong danh sách được truyền lên
        for (const createUnitAreaDto of createUnitAreaDtoList) {
            const { unitId, lessons, ...unitAreaData } = createUnitAreaDto;

            let unitArea;

            // Kiểm tra nếu unitAreaId là chuỗi rỗng hoặc không tồn tại
            if (!unitAreaData.id) {
                unitArea = this.unitAreaRepository.create({
                    ...unitAreaData,
                    unit: { id: unitId },
                });
            } else {
                // Tìm kiếm UnitArea hiện có trong cơ sở dữ liệu
                unitArea = await this.unitAreaRepository.findOne({
                    where: { id: unitAreaData.id, unit: { id: unitId } },
                });

                if (unitArea) {
                    // Cập nhật UnitArea hiện có
                    unitArea = this.unitAreaRepository.merge(unitArea, unitAreaData);
                } else {
                    // Tạo mới UnitArea nếu không tìm thấy với ID được cung cấp
                    unitArea = this.unitAreaRepository.create({
                        ...unitAreaData,
                        id: unitAreaData.id,
                        unit: { id: unitId },
                    });
                }
            }

            // Lưu UnitArea
            await this.unitAreaRepository.save(unitArea);

            // Sử dụng LessonService để xử lý lesson
            await this.lessonService.createOrUpdateManyLessons(unitArea.id, lessons);

            createdOrUpdatedUnitAreas.push(unitArea);
        }

        // Xóa các UnitArea không còn trong danh sách truyền lên
        for (const existingUnitArea of existingUnitAreas) {
            if (!unitAreaIdsInRequest.includes(existingUnitArea.id)) {
                // Xóa tất cả các bài học (lesson) liên quan trước khi xóa UnitArea
                await this.lessonService.deleteLessonsByUnitArea(existingUnitArea.id);

                // Sau đó xóa UnitArea
                await this.unitAreaRepository.remove(existingUnitArea);
            }
        }

        return createdOrUpdatedUnitAreas;
    }

    async findAllWithLessons(
        paginationOptions: PaginationOptionsDto,
    ): Promise<{ data: UnitArea[]; totalItems: number; totalPages: number }> {
        //const filter = unitId ? { unit: { id: unitId } } : {};
        //paginationOptions.filter = filter;
        // Fetch unit areas with lessons as relation
        paginationOptions.relations = ['lessons']; // Đảm bảo bao gồm quan hệ lessons
        return this.findAll(paginationOptions);
    }

    async retryWithBackoff(
        fn: () => Promise<any>,
        retries: number = 3,
        delay: number = 1000,
    ): Promise<any> {
        try {
            return await fn();
        } catch (error) {
            if (retries === 0) {
                throw error;
            }
            console.warn(`Retrying... attempts left: ${retries}`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return this.retryWithBackoff(fn, retries - 1, delay * 2); // Exponential backoff
        }
    }

    async findByUnitIdWithLessons(unitId: string): Promise<UnitAreaResponseDto[]> {
        const fetchUnitAreas = async () => {
            const unitAreas = await this.unitAreaRepository.find({
                where: { unit: { id: unitId } }, // Filter by unitId
                relations: ['unit', 'lessons'], // Load related lessons
            });

            if (!unitAreas || unitAreas.length === 0) {
                throw new NotFoundException(`No UnitAreas found for UnitId: ${unitId}`);
            }

            const transformedData: UnitAreaResponseDto[] = unitAreas.map((unitArea) => ({
                id: unitArea.id,
                title: unitArea.title,
                unitid: unitArea.unit.id,
                lessons: unitArea.lessons.map((lesson) => ({
                    id: lesson.id,
                    prerequisitelessonid: lesson.prerequisitelessonid,
                    type: lesson.type,
                    title: lesson.title,
                })),
            }));

            return transformedData;
        };

        // Use the custom retryWithBackoff function to retry if there are issues
        return this.retryWithBackoff(fetchUnitAreas, 3, 1000);
    }

    async create(createUnitAreaDto: CreateUnitAreaDto): Promise<UnitArea> {
        const { unitId, ...unitAreaData } = createUnitAreaDto;

        const unit = await this.unitService.findOneById(unitId);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        const newUnitArea = this.unitAreaRepository.create({
            ...unitAreaData,
            unit: unit,
        });

        return await this.unitAreaRepository.save(newUnitArea);
    }

    async update(id: string, updateUnitAreaDto: UpdateUnitAreaDto): Promise<UnitArea> {
        const { unitId, ...unitAreaData } = updateUnitAreaDto;

        const unitArea = await this.findOneById(id);
        if (!unitArea) {
            throw new NotFoundException('UnitArea not found');
        }

        const unit = await this.unitService.findOneById(unitId);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        const updatedUnitArea = await this.unitAreaRepository.save({
            ...unitArea,
            ...unitAreaData, // Update only the fields provided
            unit: unit,
        });

        return updatedUnitArea;
    }

    async updateUnitAreaStatus(
        id: string,
        updateStatusUnitAreaDto: UpdateUnitAreaStatusDto,
    ): Promise<UnitArea> {
        const updateUnitArea = updateStatusUnitAreaDto;

        const unitArea = await this.findOneById(id);
        if (!unitArea) {
            throw new NotFoundException('UnitArea not found');
        }

        unitArea.status = updateUnitArea.status;

        const updatedUnitArea = await this.unitAreaRepository.save(unitArea);

        return updatedUnitArea;
    }

    async findUnitAreasBySkill(skillId: string): Promise<UnitArea[]> {
        return await this.unitAreaRepository.find({
            where: { skill: { id: skillId } },
            relations: ['skill'],
        });
    }

    async findUnitAreasBySkillAndUnit(
        skillId: string,
        unitId: string,
    ): Promise<UnitArea[]> {
        return await this.unitAreaRepository.find({
            where: { skill: { id: skillId }, unit: { id: unitId } },
            relations: ['skill'],
        });
    }

    async recommendUnitAreasBasedOnWeakSkills(weakSkills: Skill[]): Promise<UnitArea[]> {
        // Tạo danh sách `UnitArea` khuyến nghị dựa trên danh sách kỹ năng yếu
        const recommendedUnitAreas: UnitArea[] = [];

        for (const skill of weakSkills) {
            // Tìm các UnitArea liên quan đến skill hiện tại
            const unitAreasForSkill = await this.findUnitAreasBySkill(skill.id);

            // Thêm các UnitArea tìm được vào danh sách khuyến nghị
            recommendedUnitAreas.push(...unitAreasForSkill);
        }

        // Loại bỏ trùng lặp các UnitArea trong danh sách khuyến nghị
        const uniqueRecommendedUnitAreas = Array.from(
            new Set(recommendedUnitAreas.map((ua) => ua.id)),
        ).map((id) => recommendedUnitAreas.find((ua) => ua.id === id));

        return uniqueRecommendedUnitAreas;
    }
}
