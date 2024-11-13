import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { Section } from 'src/database/entities/section.entity';
import { GetAccountDTO } from 'src/modules/account/dto/get-account.dto';
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

    @Expose()
    @ApiProperty()
    @Type(() => GetLevelDTO)
    level: GetLevelDTO;

    @Expose()
    @ApiProperty({ type: GetSkillDTO })
    @Type(() => GetSkillDTO)
    skill: GetSkillDTO;

    @Expose()
    @ApiProperty({ type: GetSectionDto })
    @Type(() => GetSectionDto)
    section: Section;

    @Expose()
    @ApiProperty({ type: [GetAnswerDTO] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GetAnswerDTO)
    answers: GetAnswerDTO[];

    @Expose()
    @ApiProperty()
    content: string;

    @Expose()
    @ApiProperty()
    plainContent: string;

    @Expose()
    @ApiProperty()
    correctoption: number;

    @Expose()
    @ApiProperty()
    correctanswer: string;

    @Expose()
    @ApiProperty()
    explain: string;

    @Expose()
    @ApiProperty()
    isSingleChoiceQuestion: boolean;

    @Expose()
    @ApiProperty()
    status: QuestionStatus;


}
