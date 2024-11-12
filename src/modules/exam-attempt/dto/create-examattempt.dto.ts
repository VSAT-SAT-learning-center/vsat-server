import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsUUID,
    IsInt,
    IsOptional,
    ValidateNested,
    IsArray,
    IsNumber,
    IsBoolean,
} from 'class-validator';
import { CheckExamAttemptDetail } from 'src/modules/exam-attempt-detail/dto/check-examattemptdetail';

// export class CreateExamAttemptDetail {
//     @IsUUID()
//     @ApiProperty()
//     @Expose()
//     questionId: string;

//     @ApiProperty()
//     @Expose()
//     studentAnswer: string;
// }

export class CreateExamAttemptDto {
    @IsUUID()
    @ApiProperty()
    @Expose()
    examId: string;

    @IsNumber()
    @ApiProperty()
    @Expose()
    correctAnswerRW: number;

    @IsNumber()
    @ApiProperty()
    @Expose()
    correctAnswerMath: number;

    @ApiProperty()
    @Expose()
    @IsBoolean()
    isHardRW: Boolean;

    @ApiProperty()
    @Expose()
    @IsBoolean()
    isHardMath: Boolean;

    @Expose()
    @ApiProperty({ type: [CheckExamAttemptDetail] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CheckExamAttemptDetail)
    createExamAttemptDetail: CheckExamAttemptDetail[];
}
