import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QuizConfigService } from './quiz-config.service';
import { QuizConfig } from 'src/database/entities/quizconfig.entity';
import { CreateQuizConfigForUnitDto } from './dto/create-quizconfig.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@ApiTags('QuizConfig')
@Controller('quiz-config')
export class QuizConfigController {
    constructor(private readonly quizConfigService: QuizConfigService) {}

    @Post()
    async createQuizConfigForUnit(
        @Body() createQuizConfigForUnitDto: CreateQuizConfigForUnitDto,
    ): Promise<any> {
        try {
            const quizConfigs =
                await this.quizConfigService.createQuizConfigForUnit(
                    createQuizConfigForUnitDto,
                );
            return ResponseHelper.success(
                HttpStatus.CREATED,
                quizConfigs,
                'Quiz config created successfully.',
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
