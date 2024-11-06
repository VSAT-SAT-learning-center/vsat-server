import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class GetSectionDto {
    @Expose()
    @ApiProperty()
    id: string;

    @Expose()
    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @Expose()
    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    description: string;
}
