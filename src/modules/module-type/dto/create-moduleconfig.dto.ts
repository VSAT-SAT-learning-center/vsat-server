import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsUUID } from 'class-validator';

export class ModuleConfig {
    @ApiProperty({
        example: '9ca8866b-ffb5-44fe-8cb1-8ad037bae4ae',
    })
    @IsUUID()
    @Expose()
    moduleId: string;

    @IsNumber()
    @ApiProperty()
    time: number;
}
