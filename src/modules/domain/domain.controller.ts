import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { DomainService } from './domain.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('domains')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    const { data, totalItems, totalPages } = await this.domainService.findAll(paginationOptions);

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

    return ResponseHelper.success(HttpStatus.OK, data, 'Domains retrieved successfully', paging, sorting);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const domain = await this.domainService.findOne(id);
    return ResponseHelper.success(HttpStatus.OK, domain, 'Domain retrieved successfully');
  }

  @Post()
  async create(@Body() createDomainDto: CreateDomainDto) {
    const domain = await this.domainService.create(createDomainDto);
    return ResponseHelper.success(HttpStatus.CREATED, domain, 'Domain created successfully');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDomainDto: UpdateDomainDto) {
    const domain = await this.domainService.update(id, updateDomainDto);
    return ResponseHelper.success(HttpStatus.OK, domain, 'Domain updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.domainService.remove(id);
    return ResponseHelper.success(HttpStatus.OK, null, 'Domain deleted successfully');
  }
}
