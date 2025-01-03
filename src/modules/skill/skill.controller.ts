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
import { Skill } from 'src/database/entities/skill.entity';
import { BaseController } from '../base/base.controller';
import { ApiTags } from '@nestjs/swagger';
import { SkillDto } from './dto/skill.dto';

@ApiTags('Skills')
@Controller('skills')
export class SkillController extends BaseController<Skill> {
    constructor(private readonly skillService: SkillService) {
        super(skillService, 'Skill');
    }

    @Get('domain/:name')
    async getSkillsByDomainName(@Param('name') name: string): Promise<SkillDto[]> {
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

    @Get('domainById/:id')
    async getSkillsByDomainId(@Param('id') id: string): Promise<SkillDto[]> {
        try {
            return this.skillService.getSkillsByDomainId(id);
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
