import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateExamStructureConfigDto {
    @IsString()
    @ApiProperty()
    domain: string;

    @IsString()
    @ApiProperty()
    numberOfQuestion: number;
}
