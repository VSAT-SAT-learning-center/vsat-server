import { ResponseHelper } from 'src/common/helpers/response.helper';
import { LevelDTO } from './dto/level.dto';
import { LevelService } from './level.service';
import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { Level } from 'src/database/entities/level.entity';

@ApiTags('Level')
@Controller('level')
export class LevelController extends BaseController<Level> {
    constructor(levelService: LevelService) {
      super(levelService, 'Level'); // Pass service and entity name to BaseController
    }
}