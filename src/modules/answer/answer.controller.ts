import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Answerservice } from './answer.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { CheckAnswerDTO } from './dto/check-answer.dto';

@ApiTags('Answers')
@Controller('Answer')
export class AnswerController {
    constructor(private readonly answerService: Answerservice) {}

    @Put('update-answer')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'uuid',
                    },
                    example: ['id1', 'id2'],
                },
            },
        },
    })
    async updateAnswerStatus(@Body('ids') ids: string[]) {
        try {
            const result = await this.answerService.updateAnswer(ids);
            return ResponseHelper.success(
                HttpStatus.OK,
                result,
                SuccessMessages.update('Answer'),
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

    // @Post('create-multiple-answers')
    // async createMultipleAnswers(
    //     @Body() createMultipleAnswersDto: CreateMultipleAnswersDTO,
    //     @Param() id: string,
    // ) {
    //     try {
    //         const newAnswers = await this.answerService.createMultipleAnswers(
    //             createMultipleAnswersDto,
    //             id,
    //         );
    //         return ResponseHelper.success(
    //             HttpStatus.CREATED,
    //             newAnswers,
    //             SuccessMessages.create('Answers'),
    //         );
    //     } catch (error) {
    //         throw new HttpException(
    //             {
    //                 statusCode: error.status || HttpStatus.BAD_REQUEST,
    //                 message: error.message || 'An error occurred',
    //             },
    //             error.status || HttpStatus.BAD_REQUEST,
    //         );
    //     }
    // }

    @Post('check-answer')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                answers: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            questionId: { type: 'string', format: 'uuid' },
                            answerId: { type: 'string', format: 'uuid' },
                        },
                    },
                },
            },
        },
    })
    async checkAnswer(@Body('answers') answers: CheckAnswerDTO[]) {
        try {
            const results = await this.answerService.checkAnswer(answers);

            results.every((result) => result.isCorrect);

            return ResponseHelper.success(HttpStatus.OK, results);
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
