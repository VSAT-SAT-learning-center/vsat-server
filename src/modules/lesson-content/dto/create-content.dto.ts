import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateQuestionDto } from './create-question.dto';
import { CreateExampleDto } from './create-example.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContentDto {
    @ApiProperty({ example: 'This is the content text', description: 'Text content of the lesson',})
    @IsString()
    text: string;

    @ApiProperty({ type: [CreateExampleDto], description: 'Array of example objects', })
    @ValidateNested({ each: true })
    @Type(() => CreateExampleDto)
    examples: CreateExampleDto[];
}
