import { Expose, Type } from 'class-transformer';
import { BaseDTO } from 'src/common/dto/base.dto';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { Section } from 'src/database/entities/section.entity';
import { GetLessonDTO } from 'src/modules/lesson/dto/get-lesson.dto';
import { GetLevelDTO } from 'src/modules/level/dto/get-level.dto';
import { GetSectionDto } from 'src/modules/section/dto/get-section.dto';
import { GetSkillDTO } from 'src/modules/skill/dto/get-skill.to';
import { GetUnitDTO } from 'src/modules/unit/dto/get-unit.dto';

export class GetQuestionDTO extends BaseDTO {
    @Expose()
    id: string;

    @Expose()
    @Type(() => GetLevelDTO)
    level: GetLevelDTO;

    @Expose()
    @Type(() => GetSkillDTO)
    skill: GetSkillDTO;

    @Expose()
    @Type(() => GetSectionDto)
    section: Section;

    @Expose()
    content: string;

    @Expose()
    correctoption: number;

    @Expose()
    correctanswer: string;

    @Expose()
    explain: string;

    @Expose()
    isSingleChoiceQuestion: boolean;

    @Expose()
    status: QuestionStatus

}
