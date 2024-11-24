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
import { SectionService } from './section.service';
import { SectionDTO } from './dto/section.dto';
import { SuccessMessages } from 'src/common/message/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sections')
@Controller('section')
export class SectionController {
    constructor(private readonly sectionService: SectionService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() sectionDto: SectionDTO, @Req() req) {
        try {
            const userId = req.user.id;
            const saveSection = await this.sectionService.save(
                sectionDto,
                userId,
            );
            return ResponseHelper.success(
                HttpStatus.CREATED,
                saveSection,
                SuccessMessages.create('Section'),
            );
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

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: string,
        @Body() sectionDto: SectionDTO,
        @Req() req,
    ) {
        try {
            const userId = req.user.id;
            const updatedSection = await this.sectionService.update(
                id,
                sectionDto,
                userId,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                updatedSection,
                SuccessMessages.create('Section'),
            );
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

    @Get()
    async find() {
        try {
            const section = await this.sectionService.find();
            return ResponseHelper.success(
                HttpStatus.OK,
                section,
                SuccessMessages.create('Section'),
            );
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

    @Get(':id')
    async findById(@Param('id') id: string) {
        try {
            const section = await this.sectionService.findOneById(id);
            return ResponseHelper.success(
                HttpStatus.OK,
                section,
                SuccessMessages.create('Section'),
            );
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
