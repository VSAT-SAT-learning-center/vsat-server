import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionDTO } from './dto/section.dto';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('section')
export class SectionController {
    constructor(private readonly sectionService: SectionService) {}

    @Post()
    async create(@Body() sectionDto: SectionDTO) {
        try {
            const saveSection = await this.sectionService.save(sectionDto);
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
    async update(@Param('id') id: string, @Body() sectionDto: SectionDTO) {
        try {
            const updatedSection = await this.sectionService.update(
                id,
                sectionDto,
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
