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
    HttpException,
} from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { Skill } from 'src/database/entities/skill.entity';
import { BaseController } from '../base/base.controller';
import { ApiTags } from '@nestjs/swagger';
import { SkillDto } from './dto/skill.dto';
import { SuccessMessages } from 'src/common/constants/success-messages';

@ApiTags('Skills')
@Controller('skills')
export class SkillController extends BaseController<Skill> {
    constructor(private readonly skillService: SkillService) {
        super(skillService, 'Skill');
    }

    @Get('domain/:name')
    async getSkillsByDomainId(@Param('name') name: string): Promise<SkillDto[]> {
        try {
            return this.skillService.getSkillsByDomainName(name);
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }
}
