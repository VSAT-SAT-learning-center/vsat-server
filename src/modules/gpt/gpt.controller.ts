import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { GptService } from './gpt.service';
import { CompleteInputDTO } from './dto/gpt.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('gpt')
@Controller('gpt')
export class GptController {
    constructor(private readonly gptService: GptService) {}

    @Post()
    getChatCompleteMsg(
        @Body(new ValidationPipe({ transform: true }))
        data: CompleteInputDTO,
    ) {
        return this.gptService.getAiModelAnswer(data);
    }
}
