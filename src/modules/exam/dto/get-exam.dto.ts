import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { Answer } from 'src/database/entities/anwser.entity';
import { Domain } from 'src/database/entities/domain.entity';
import { Level } from 'src/database/entities/level.entity';
import { Question } from 'src/database/entities/question.entity';
import { Section } from 'src/database/entities/section.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { GetAnswerDTO } from 'src/modules/answer/dto/get-answer.dto';
import { GetLevelDTO } from 'src/modules/level/dto/get-level.dto';
import { GetQuestionDTO } from 'src/modules/question/dto/get-question.dto';
import { GetSectionDto } from 'src/modules/section/dto/get-section.dto';
import { GetSkillDTO } from 'src/modules/skill/dto/get-skill.to';

export class ExamStructureTypeDto {
    @Expose()
    @ApiProperty()
    id: string;

    @Expose()
    @ApiProperty()
    name: string;

    @Expose()
    @ApiProperty()
    numberOfReadWrite: number;

    @Expose()
    @ApiProperty()
    numberOfMath: number;
}

export class SkillDto {
    @Expose()
    @ApiProperty({ type: Skill })
    @Type(() => Skill)
    skill: Skill;

    @Expose()
    @ApiProperty({ type: Domain })
    @Type(() => Domain)
    domain: Domain;
}

export class QuestionDto {
    @Expose()
    @ApiProperty()
    id: string;

    @Expose()
    @ApiProperty()
    @Type(() => Level)
    level: Level;

    @Expose()
    @ApiProperty({ type: SkillDto })
    @Type(() => SkillDto)
    skill: SkillDto;

    @Expose()
    @ApiProperty({ type: Section })
    @Type(() => Section)
    section: Section;

    @Expose()
    @ApiProperty({ type: [Answer] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Answer)
    answers: Answer[];

    @Expose()
    @ApiProperty()
    content: string;

    @Expose()
    @ApiProperty()
    plainContent: string;

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

export class ExamQuestion {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    level: string | null;

    @ApiProperty()
    numberofquestion: number;

    @ApiProperty()
    time: number;

    @ApiProperty()
    section: string;

    @ApiProperty({ type: [QuestionDto] })
    @IsArray()
    questions: QuestionDto[];
}

export class GetExamDto {
    @ApiProperty()
    title: string;

    @ApiProperty()
    requiredCorrectInModule1RW: number;

    @ApiProperty()
    requiredCorrectInModule1M: number;

    @ApiProperty()
    examType: string;

    @ApiProperty({ type: [ExamQuestion] })
    @IsArray()
    examQuestions: ExamQuestion[];

    @Expose()
    @ApiProperty({ type: ExamStructureTypeDto })
    @Type(() => ExamStructureTypeDto)
    examStructureType: ExamStructureTypeDto;
}
