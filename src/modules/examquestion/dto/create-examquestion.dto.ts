import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsUUID, ValidateNested } from 'class-validator';
import { Exam } from 'src/database/entities/exam.entity';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { Question } from 'src/database/entities/question.entity';
import { CreateExamDto } from 'src/modules/exam/dto/create-exam.dto';
import { CreateQuestionExamDto } from 'src/modules/question/dto/create-question-exam.dto';
import { CreateQuestionFileDto } from 'src/modules/question/dto/create-question-file.dto';
import { CreateQuestionDTO } from 'src/modules/question/dto/create-question.dto';

export class CreateExamQuestionDTO {
    @ApiProperty({
        description: 'ID của ModuleType',
        example: '12f857dc-1930-4809-af7a-818c66207171',
    })
    @Expose()
    @IsUUID()
    moduleTypeId: string;

    @ApiProperty({ type: CreateExamDto })
    @ValidateNested()
    @Type(() => CreateExamDto)
    exam: CreateExamDto;

    @ApiProperty({ type: [CreateQuestionExamDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionExamDto)
    question: CreateQuestionExamDto[];
}
