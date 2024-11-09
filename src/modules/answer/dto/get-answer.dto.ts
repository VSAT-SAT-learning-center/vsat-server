import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GetAnswerDTO {
    @Expose()
    @ApiProperty()
    id: string;

    @Expose()
    @ApiProperty()
    label: string;

    @Expose()
    @ApiProperty()
    text: string;

    @ApiProperty()
    @Expose()
    isCorrectAnswer: boolean;
}
