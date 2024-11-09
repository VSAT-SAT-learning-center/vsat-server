import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';

export class UpdateDeleteExamQuestion {
    @IsUUID()
    @Expose()
    @ApiProperty()
    id: string;
}

export class UpdateQuestion {
    @IsUUID()
    @Expose()
    @ApiProperty()
    moduleTypeId: string;

    @IsUUID()
    @Expose()
    @ApiProperty()
    examId: string;

    @IsUUID()
    @Expose()
    @ApiProperty()
    questionId: string;
}

export class UpdateExamQuestion {
    @ApiProperty({ type: [UpdateDeleteExamQuestion] })
    @ValidateNested({ each: true })
    @Type(() => UpdateDeleteExamQuestion)
    updateDeleteExamQuestion: UpdateDeleteExamQuestion[];

    @ApiProperty({ type: [UpdateQuestion] })
    @ValidateNested({ each: true })
    @Type(() => UpdateQuestion)
    updateQuestion: UpdateQuestion[];
}
