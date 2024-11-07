import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class FetchByContentDTO {
    @ApiProperty({
        example: ['string1', 'string2'],
    })
    @IsArray()
    @Expose()
    content: string[];
}
