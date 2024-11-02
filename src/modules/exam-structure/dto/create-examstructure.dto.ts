import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsString,
    IsUUID,
    IsOptional,
    IsNotEmpty,
    IsNumber,
} from 'class-validator';
import { CreateExamStructureConfigDto } from 'src/modules/exam-structure-config/dto/create-exam-structure-config.dto';
import { CreateModuleTypeDto } from 'src/modules/module-type/dto/create-moduletype.dto';

export class CreateExamStructureDto {
    @IsUUID()
    @IsString()
    @Expose()
    examScoreId: string;

    @IsString()
    @Expose()
    examStructureType: string;

    @IsString()
    @Expose()
    structurename: string;

    @IsString()
    @Expose()
    description: string;

    @IsNumber()
    @Expose()
    requiredCorrectInModule1RW: number;

    @IsNumber()
    @Expose()
    requiredCorrectInModule1M: number;

    @ApiProperty({ type: [CreateExamStructureConfigDto] })
    @Type(() => CreateExamStructureConfigDto)
    examStructureConfig: CreateExamStructureConfigDto;

    @ApiProperty({ type: [CreateModuleTypeDto] })
    @Type(() => CreateModuleTypeDto)
    moduleType: CreateModuleTypeDto;
}
