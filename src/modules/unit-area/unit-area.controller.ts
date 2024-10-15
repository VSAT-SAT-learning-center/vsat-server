import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    HttpStatus,
    Query,
} from '@nestjs/common';
import { CreateUnitAreaDto } from './dto/create-unitarea.dto';
import { UpdateUnitAreaDto } from './dto/update-unitarea.dto';
import { UnitAreaService } from './unit-area.service';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@ApiTags('UnitAreas')
@Controller('unit-areas')
export class UnitAreaController extends BaseController<UnitArea> {
    constructor(private readonly unitAreaService: UnitAreaService) {
        super(unitAreaService, 'UnitArea');
    }

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
    async findAllWithLessons(
        @Query() paginationOptions: PaginationOptionsDto,
    ) {
        // Gọi UnitAreaService để tìm UnitArea cùng với danh sách Lesson
        const { data, totalItems, totalPages } =
            await this.unitAreaService.findAllWithLessons(paginationOptions);

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
            SuccessMessages.gets('UnitArea with Lessons'),
            paging,
            sorting,
        );
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const unitArea = await this.unitAreaService.findOne(id, ['lessons']);
        return ResponseHelper.success(
            HttpStatus.OK,
            unitArea,
            SuccessMessages.get('UnitArea'),
        );
    }

    @Post()
    async create(@Body() createUnitAreaDto: CreateUnitAreaDto) {
        const createdUnitArea =
            await this.unitAreaService.create(createUnitAreaDto);
        return ResponseHelper.success(
            HttpStatus.CREATED,
            createdUnitArea,
            SuccessMessages.create('UnitArea'),
        );
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUnitAreaDto: UpdateUnitAreaDto,
    ) {
        const updatedUnitArea = await this.unitAreaService.update(
            id,
            updateUnitAreaDto,
        );
        return ResponseHelper.success(
            HttpStatus.OK,
            updatedUnitArea,
            SuccessMessages.update('UnitArea'),
        );
    }
}
