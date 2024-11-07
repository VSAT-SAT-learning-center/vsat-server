import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    Put,
    HttpStatus,
} from '@nestjs/common';
import { CreateDomainDistributionDto } from './dto/create-domaindistribution.dto';
import { UpdateDomainDistributionDto } from './dto/update-domaindistribution.dto';
import { DomainDistributionService } from './domain-distribution.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { DomainDistribution } from 'src/database/entities/domaindistribution.entity';

@ApiTags('DomainDistributions')
@Controller('domain-distributions')
export class DomainDistributionController {
    constructor(domainDistributionService: DomainDistributionService) {}
}
