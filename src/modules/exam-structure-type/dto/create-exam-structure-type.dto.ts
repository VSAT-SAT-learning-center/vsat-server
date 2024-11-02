import { CreateExamStructureConfigDto } from '../../exam-structure-config/dto/create-exam-structure-config.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, isInt, IsNumber, IsString } from 'class-validator';
import { CreateModuleTypeDto } from 'src/modules/module-type/dto/create-moduletype.dto';

export class CreateExamStructureTypeDto {
    @Expose()
    @IsString()
    @ApiProperty()
    name: string;

    @Expose()
    @IsNumber()
    @ApiProperty()
    numberOfReadWrite: number;

    @Expose()
    @IsNumber()
    @ApiProperty()
    numberOfMath: number;
}
