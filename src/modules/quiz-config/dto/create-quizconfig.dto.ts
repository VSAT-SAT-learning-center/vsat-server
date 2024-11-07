import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SkillConfigDto {
    @ApiProperty({
        example: 'a6e1d5a2-8453-42b3-8c9f-fdfefea2a613'
    })
    @IsUUID()
    skillId: string;

    @ApiProperty({
        example: 5,
        minimum: 1
    })
    @IsInt()
    @Min(1)
    totalQuestions: number;
}

export class CreateQuizConfigForUnitDto {
    @ApiProperty({
        example: 'b5fbd8f9-c9d7-4e19-bd8d-9ab0c5c3f7d8'
    })
    @IsUUID()
    unitId: string;

    @ApiProperty({
        type: [SkillConfigDto]
    })
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => SkillConfigDto)
    skillConfigs: SkillConfigDto[];
}
