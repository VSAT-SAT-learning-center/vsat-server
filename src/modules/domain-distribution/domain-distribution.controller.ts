import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { CreateDomainDistributionDto } from './dto/create-domaindistribution.dto';
import { UpdateDomainDistributionDto } from './dto/update-domaindistribution.dto';
import { DomainDistributionService } from './domain-distribution.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('domaindistributions')
export class DomainDistributionController {
  constructor(private readonly domainDistributionService: DomainDistributionService) {}

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptionsDto) {
    const { data, totalItems, totalPages } = await this.domainDistributionService.findAll(paginationOptions);

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

    return ResponseHelper.success(HttpStatus.OK, data, 'Domain Distributions retrieved successfully', paging, sorting);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const domainDistribution = await this.domainDistributionService.findOne(id);
    return ResponseHelper.success(HttpStatus.OK, domainDistribution, 'Domain Distribution retrieved successfully');
  }

  @Post()
  async create(@Body() createDomainDistributionDto: CreateDomainDistributionDto) {
    const domainDistribution = await this.domainDistributionService.create(createDomainDistributionDto);
    return ResponseHelper.success(HttpStatus.CREATED, domainDistribution, 'Domain Distribution created successfully');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDomainDistributionDto: UpdateDomainDistributionDto) {
    const domainDistribution = await this.domainDistributionService.update(id, updateDomainDistributionDto);
    return ResponseHelper.success(HttpStatus.OK, domainDistribution, 'Domain Distribution updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.domainDistributionService.remove(id);
    return ResponseHelper.success(HttpStatus.OK, null, 'Domain Distribution deleted successfully');
  }
}
