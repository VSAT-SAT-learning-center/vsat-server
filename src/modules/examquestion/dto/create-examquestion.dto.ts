import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';
import { FetchGetQuestionDTO } from 'src/modules/question/dto/fetch-getquestion.dto';
import { GetQuestionDTO } from 'src/modules/question/dto/get-question.dto';

export class Domain {
    @Expose()
    @IsString()
    @ApiProperty()
    domain: string;

    @ApiProperty({ type: [FetchGetQuestionDTO] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FetchGetQuestionDTO)
    questions: FetchGetQuestionDTO[];
}

export class CreateExamQuestionDTO {
    @Expose()
    @IsUUID()
    @ApiProperty()
    moduleId: string;

    @ApiProperty({ type: [Domain] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Domain)
    domains: Domain[];
}
