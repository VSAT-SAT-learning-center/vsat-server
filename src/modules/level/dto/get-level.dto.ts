import { Get } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { BaseDTO } from 'src/common/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetLevelDTO extends BaseDTO {
    @Expose()
    @ApiProperty()
    id: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    name: string;
}
