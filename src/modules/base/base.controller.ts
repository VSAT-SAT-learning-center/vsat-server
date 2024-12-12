import {
    Body,
    Delete,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { BaseService } from './base.service'; 
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/message/success-messages';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ApiQuery } from '@nestjs/swagger';

export class BaseController<T> {
    constructor(
        private readonly baseService: BaseService<T>, 
        private readonly entityName: string, 
    ) {}

    @Get()
    @ApiQuery({
        name: 'page',
        required: false,
        example: 1,
        description: 'Page number for pagination',
    })
    @ApiQuery({
        name: 'pageSize',
        required: false,
        example: 10,
        description: 'Number of items per page',
    })
    @ApiQuery({
        name: 'sortBy',
        required: false,
        example: 'id',
        description: 'Field to sort by',
    })
    @ApiQuery({
        name: 'sortOrder',
        required: false,
        example: 'ASC',
        enum: ['ASC', 'DESC'],
        description: 'Order to sort (ASC/DESC)',
    })
    async findAll(@Query() paginationOptions: PaginationOptionsDto) {
        const { page, pageSize, relations } = paginationOptions;

        
        if (!page || !pageSize) {
            const data = await this.baseService.getAll(relations);
            return ResponseHelper.success(
                HttpStatus.OK,
                data,
                SuccessMessages.gets(this.entityName),
            );
        }

        if(!paginationOptions.page) {
            paginationOptions.page = 1;
        } 

        if(!paginationOptions.pageSize) {
            paginationOptions.pageSize = 10;
        }
        
        
        const { data, totalItems, totalPages } = await this.baseService.findAll(paginationOptions);
        const paging = {
            page: paginationOptions.page,
            pageSize: paginationOptions.pageSize,
            totalItems,
            totalPages,
        };

        const sorting = {
            sortBy: paginationOptions.sortBy,
            sortOrder: paginationOptions.sortOrder,
        };

        return ResponseHelper.success(
            HttpStatus.OK,
            data,
            SuccessMessages.gets(this.entityName),
            paging,
            sorting,
        );
    }

    @Post()
    async create(
        @Body() createDto: any,
        
    ) {
        
        const createdEntity = await this.baseService.create(createDto);
        return ResponseHelper.success(
            HttpStatus.CREATED,
            createdEntity,
            SuccessMessages.create(this.entityName),
        );
    }

    @Get(':id')
    async findOneById(@Param('id') id: string) {
        const entity = await this.baseService.findOneById(id);
        if (!entity) {
            return ResponseHelper.error(
                null,
                HttpStatus.NOT_FOUND,
                `${this.entityName} not found`,
            );
        }
        return ResponseHelper.success(
            HttpStatus.OK,
            entity,
            SuccessMessages.get(this.entityName),
        );
    }

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateDto: any) {
        const updatedEntity = await this.baseService.update(id, updateDto);
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedEntity,
            SuccessMessages.update(this.entityName),
        );
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.baseService.remove(id);
        return ResponseHelper.success(
            HttpStatus.OK,
            null,
            SuccessMessages.delete(this.entityName),
        );
    }
}
