import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { CreateExamQuestionDTO } from 'src/modules/examquestion/dto/create-examquestion.dto';
import { CreateQuestionExamDto } from 'src/modules/question/dto/create-question-exam.dto';

export class CreateExamDto {
    @ApiProperty({
        example: '9ca8866b-ffb5-44fe-8cb1-8ad037bae4ae',
    })
    @IsUUID()
    @Expose()
    examStructureId: string;

    @ApiProperty({
        example: '49b5d7f2-edad-4b46-a5a8-02c77de6ea9a',
    })
    @IsUUID()
    @Expose()
    examTypeId: string;

    @ApiProperty({
        example: 'Đề thi kiểm tra Toán học',
    })
    @IsString()
    @Expose()
    title: string;

    @ApiProperty({
        example: 'Đề thi kiểm tra kiến thức Toán học lớp 10',
    })
    @IsString()
    @Expose()
    description?: string;

    @ApiProperty({ type: [CreateExamQuestionDTO] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateExamQuestionDTO)
    examQuestions: CreateExamQuestionDTO[];
}
