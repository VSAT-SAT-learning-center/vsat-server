import { Get } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { BaseDTO } from 'src/common/dto/base.dto';

export class GetLevelDTO extends BaseDTO {
    @Expose()
    id: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;
}
