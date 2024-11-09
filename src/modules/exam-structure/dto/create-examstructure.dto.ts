import { ModuleConfig } from 'src/modules/module-type/dto/create-moduleconfig.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsString, IsUUID, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { CreateExamStructureConfigDto } from 'src/modules/exam-structure-config/dto/create-exam-structure-config.dto';
import { CreateModuleTypeDto } from 'src/modules/module-type/dto/create-moduletype.dto';

export class CreateExamStructureDto {
    @IsUUID()
    @IsString()
    @Expose()
    @ApiProperty()
    examScoreId: string;

    @IsUUID()
    @IsString()
    @Expose()
    @ApiProperty()
    examSemesterId: string;

    @IsString()
    @Expose()
    @ApiProperty()
    examStructureType: string;

    @IsString()
    @Expose()
    @ApiProperty()
    structurename: string;

    @IsString()
    @Expose()
    @ApiProperty()
    description: string;

    @IsNumber()
    @Expose()
    @ApiProperty()
    requiredCorrectInModule1RW: number;

    @IsNumber()
    @Expose()
    @ApiProperty()
    requiredCorrectInModule1M: number;

    @ApiProperty({ type: [CreateExamStructureConfigDto] })
    @Type(() => CreateExamStructureConfigDto)
    examStructureConfig: CreateExamStructureConfigDto;

    @ApiProperty({ type: [CreateModuleTypeDto] })
    @Type(() => CreateModuleTypeDto)
    moduleType: CreateModuleTypeDto;
}
