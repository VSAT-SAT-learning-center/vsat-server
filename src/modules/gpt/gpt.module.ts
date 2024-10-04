import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GptController } from './gpt.controller';
import { GptService } from './gpt.service';

@Module({
    imports: [HttpModule],
    controllers: [GptController],
    providers: [GptService],
})
export class GptModule {}
