import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumber,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class UpdateQuestionDTO extends BaseDTO {
    @Expose()
    @ValidateNested()
    @ApiProperty({ example: ''})
    levelId: string;

    @Expose()
    @ValidateNested()
    @ApiProperty({ example: ''})
    skillId: string;

    @Expose()
    @ValidateNested()
    @ApiProperty({ example: ''})
    secionId: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    content: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    explain: string;

    @Expose()
    @ApiProperty()
    @IsNumber()
    sort: number;
}
