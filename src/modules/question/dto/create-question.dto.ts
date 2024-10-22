import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { CreateAnswerDTO } from 'src/modules/answer/dto/create-answer.dto';

class UnitIdDTO {
    @ApiProperty({
        description: 'ID of the unit',
        example: '1ecbaafa-9417-4543-83ba-5d87a5eda1f0',
    })
    @IsUUID()
    @IsNotEmpty()
    id: string;
}

class LevelIdDTO {
    @ApiProperty({
        description: 'ID of the level',
        example: '81b2871e-65be-4ff3-be17-8696e4c5e959',
    })
    @IsUUID()
    @IsNotEmpty()
    id: string;
}

class SkillIdDTO {
    @ApiProperty({
        description: 'ID of the skill',
        example: 'd2396b02-d8d9-420e-95fa-115048df0654',
    })
    @IsUUID()
    @IsNotEmpty()
    id: string;
}

class LessonIdDTO {
    @ApiProperty({
        description: 'ID of the lesson',
        example: '32212417-09b7-4add-9fb3-1df5688b3b6d',
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
    explain: string;

    @Expose()
    @ApiProperty()
    @IsNumber()
    sort: number;

    @ApiProperty({ type: [CreateAnswerDTO] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAnswerDTO)
    answers: CreateAnswerDTO[];
}
