import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';
import { QuestionStatus } from 'src/common/enums/question-status.enum';

class UnitIdDTO {
    @ApiProperty({
        description: 'ID of the unit',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsNotEmpty()
    id: string;
}

class LevelIdDTO {
    @ApiProperty({
        description: 'ID of the level',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsNotEmpty()
    id: string;
}

class SkillIdDTO {
    @ApiProperty({
        description: 'ID of the skill',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsNotEmpty()
    id: string;
}

class LessonIdDTO {
    @ApiProperty({
        description: 'ID of the lesson',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsNotEmpty()
    id: string;
}

export class CreateQuestionDTO extends BaseDTO {
    @Expose()
    @ValidateNested()
    @Type(() => UnitIdDTO)
    @ApiProperty({ type: UnitIdDTO })
    unit: UnitIdDTO;

    @Expose()
    @ValidateNested()
    @Type(() => LevelIdDTO)
    @ApiProperty({ type: LevelIdDTO })
    level: LevelIdDTO;

    @Expose()
    @ValidateNested()
    @Type(() => SkillIdDTO)
    @ApiProperty({ type: SkillIdDTO })
    skill: SkillIdDTO;

    @Expose()
    @ValidateNested()
    @Type(() => LessonIdDTO)
    @ApiProperty({ type: LessonIdDTO })
    lesson: LessonIdDTO;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    content: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    answer1: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    answer2: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    answer3: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    answer4: string;

    @Expose()
    @IsNotEmpty()
    @ApiProperty()
    correctoption: number;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    correctanswer: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    explain: string;

    @Expose()
    @ApiProperty()
    @IsNumber()
    sort: number;
}
