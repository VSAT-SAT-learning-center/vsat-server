import { Expose, Type } from 'class-transformer';
import { GetLessonDTO } from 'src/modules/lesson/dto/get-lesson.dto';
import { GetLevelDTO } from 'src/modules/level/dto/get-level.dto';
import { GetSkillDTO } from 'src/modules/skill/dto/get-skill.to';
import { GetUnitDTO } from 'src/modules/unit/dto/get-unit.dto';

export class GetQuestionDTO {
    @Expose()
    id: string;

    @Expose()
    @Type(() => GetUnitDTO)
    unit: GetUnitDTO;

    @Expose()
    @Type(() => GetLevelDTO)
    level: GetLevelDTO;

    @Expose()
    @Type(() => GetSkillDTO)
    skill: GetSkillDTO;

    @Expose()
    @Type(() => GetLessonDTO)
    lesson: GetLessonDTO;

    @Expose()
    content: string;

    @Expose()
    correctoption: number;

    @Expose()
    correctanswer: string;

    @Expose()
    explain: string;

    @Expose()
    sort: number;
}
