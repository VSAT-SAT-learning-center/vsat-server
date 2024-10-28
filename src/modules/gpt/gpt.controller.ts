import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompleteInputDTO } from './dto/gpt.dto';
import { GptService } from './gpt.service';

@ApiTags('GPT')
@Controller('gpts')
export class GptController {
    constructor(private readonly gptService: GptService) {}

    @Post('censor-question')
    getChatCompleteMsg(
        @Body(new ValidationPipe({ transform: true }))
        data: CompleteInputDTO,
    ) {
        return this.gptService.getAiModelAnswer(data);
    }
}
