import { Body, Controller, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompleteInputDTO } from './dto/gpt.dto';
import { GptService } from './gpt.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('GPT')
@Controller('gpts')
export class GptController {
    constructor(private readonly gptService: GptService) {}

    @Post('censor-question')
    @UseGuards(JwtAuthGuard, new RoleGuard(['manager']))
    getChatCompleteMsg(
        @Body(new ValidationPipe({ transform: true }))
        data: CompleteInputDTO,
    ) {
        return this.gptService.getAiModelAnswer(data);
    }
}
