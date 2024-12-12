import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { Repository, DeepPartial, FindManyOptions } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class BaseService<T> {
    constructor(
        protected readonly repository: Repository<T>,
        protected readonly paginationService?: PaginationService, 
    ) {}

    async getAll(relations?: string[]): Promise<any> {
        try {
            return await this.repository.find({
                relations, 
            });
        } catch (error) {
            console.error('Log Error:', error);
            throw new HttpException(
                'Failed to retrieve data',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findAll(
        paginationOptions: PaginationOptionsDto,
    ): Promise<{ data: T[]; totalItems: number; totalPages: number }> {
        const { page, pageSize, sortBy, sortOrder, relations } =
            paginationOptions;

        try {
            const findOptions: FindManyOptions<T> = {
                skip: (page - 1) * pageSize,
                take: pageSize,
                relations, 
            };

            if (sortBy && sortOrder) {
                findOptions.order = {
                    [sortBy]: sortOrder,
                } as FindManyOptions<T>['order'];
            }

            const [items, totalItems] =
                await this.repository.findAndCount(findOptions);

            const totalPages = Math.ceil(totalItems / pageSize);

            return { data: items, totalItems, totalPages };
        } catch (error) {
            console.error('Log Error:', error);
            throw new HttpException(
                'Failed to retrieve data',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOneById(
        id: string | number,
        relations: string[] = [],
    ): Promise<T | undefined> {
        try {
            const entity = await this.repository.findOne({
                where: { id } as any,
                relations,
            });

            if (!entity) {
                throw new NotFoundException(`${id} not found`);
            }

            return entity;
        } catch (error) {
            console.error('Log Error:', error);
            throw new HttpException(
                'Failed to retrieve entity',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async create(
        entity: DeepPartial<T>,
        
    ): Promise<T> {
        try {
            
            const newEntity = this.repository.create(entity);
            return this.repository.save(newEntity);
        } catch (error) {
            console.error('Log Error:', error);
            throw new HttpException(
                'Failed to create entity',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async update(
        id: string | number,
        entity: QueryDeepPartialEntity<T>,
    ): Promise<T | undefined> {
        try {
            const updateResult = await this.repository.update(id, entity);
            if (updateResult.affected === 0) {
                throw new HttpException(
                    `${id} not found`,
                    HttpStatus.NOT_FOUND,
                );
            }

            return this.findOneById(id);
        } catch (error) {
            console.error('Log Error:', error);
            throw new HttpException(
                'Failed to update entity',
                HttpStatus.BAD_REQUEST,
            );
        }
    }
    
    
    async remove(id: string | number): Promise<void> {
        try {
            const deleteResult = await this.repository.delete(id);
            if (deleteResult.affected === 0) {
                throw new HttpException(
                    `${id} not found`,
                    HttpStatus.NOT_FOUND,
                );
            }
        } catch (error) {
            console.error('Log Error:', error);
            throw new HttpException(
                'Failed to delete entity',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
