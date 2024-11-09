import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BaseDTO } from 'src/common/dto/base.dto';

export class FetchGetQuestionDTO extends BaseDTO {
    @Expose()
    @ApiProperty()
    id: string;
}
