import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { Section } from 'src/database/entities/section.entity';
import { CreateAnswerDTO } from 'src/modules/answer/dto/create-answer.dto';
import { GetAnswerDTO } from 'src/modules/answer/dto/get-answer.dto';
import { GetLessonDTO } from 'src/modules/lesson/dto/get-lesson.dto';
import { GetLevelDTO } from 'src/modules/level/dto/get-level.dto';
import { GetSectionDto } from 'src/modules/section/dto/get-section.dto';
import { GetSkillDTO } from 'src/modules/skill/dto/get-skill.to';
import { GetUnitDTO } from 'src/modules/unit/dto/get-unit.dto';

export class GetQuestionDTO extends BaseDTO {
    @Expose()
    @ApiProperty()
    id: string;
}
