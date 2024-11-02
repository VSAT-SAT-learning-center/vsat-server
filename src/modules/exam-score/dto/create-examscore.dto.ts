import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsString, ValidateNested, IsArray, IsUUID } from 'class-validator';
import { CreateExamScoreDetailDto } from 'src/modules/exam-score-detail/dto/create-examscoredetail.dto';

export class CreateExamScoreDto {
    @ApiProperty()
    @Expose()
    @IsString()
    title: string;

    @ApiProperty()
    @Expose()
    @IsString()
    type: string;

    @ApiProperty({ type: [CreateExamScoreDetailDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateExamScoreDetailDto)
    createExamScoreDetail: CreateExamScoreDetailDto[];
}
