import { ApiProperty } from "@nestjs/swagger";
import { SkillDetailsDto } from "./response-complete-quiz-attempt.dto";

export class CategorizedSkillDetailsDto {
    @ApiProperty({ type: [SkillDetailsDto] })
    increasedSkills: SkillDetailsDto[];

    @ApiProperty({ type: [SkillDetailsDto] })
    decreasedSkills: SkillDetailsDto[];

    @ApiProperty({ type: [SkillDetailsDto] })
    unchangedSkills: SkillDetailsDto[];
}
