import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { UnitAreaService } from "../unit-area/unit-area.service";
import { UnitArea } from "src/database/entities/unitarea.entity";
import { QuizAttemptService } from "../quiz-attempt/quiz-attempt.service";

@Injectable()
export class RecommendationService {
    constructor(
        @Inject(forwardRef(() => QuizAttemptService))
        private readonly quizAttemptService: QuizAttemptService,
        private readonly unitAreaService: UnitAreaService,
    ) {}

    async recommendUnitAreas(quizAttemptId: string): Promise<UnitArea[]> {
        const weakSkills = await this.quizAttemptService.findWeakSkillsByQuizAttempt(quizAttemptId);

        // Lấy danh sách UnitArea liên quan đến các kỹ năng yếu
        const recommendedUnitAreas = [];
        for (const skill of weakSkills) {
            const unitAreas = await this.unitAreaService.findUnitAreasBySkill(skill.id);
            recommendedUnitAreas.push(...unitAreas);
        }

        return recommendedUnitAreas;
    }
}