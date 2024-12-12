import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { UnitAreaService } from "../unit-area/unit-area.service";
import { UnitArea } from "src/database/entities/unitarea.entity";
import { QuizAttemptService } from "../quiz-attempt/quiz-attempt.service";
import { UnitProgressService } from "../unit-progress/unit-progress.service";

@Injectable()
export class RecommendationService {
    constructor(
        @Inject(forwardRef(() => QuizAttemptService))
        private readonly quizAttemptService: QuizAttemptService,
        private readonly unitAreaService: UnitAreaService,
        private readonly unitProgressService: UnitProgressService
    ) {}

    async recommendUnitAreas(quizAttemptId: string): Promise<UnitArea[]> {
        const weakSkills = await this.quizAttemptService.findWeakSkillsByQuizAttempt(quizAttemptId);

        const recommendedUnitAreas = [];
        for (const skill of weakSkills) {
            const unitAreas = await this.unitAreaService.findUnitAreasBySkill(skill.id);
            recommendedUnitAreas.push(...unitAreas);
        }

        return recommendedUnitAreas;
    }

    async recommendUnitAreasWithUnitProgress(quizAttemptId: string, unitProgressId: string): Promise<UnitArea[]> {
        const weakSkills = await this.quizAttemptService.findWeakSkillsByQuizAttempt(quizAttemptId);
        
        const unitProgress = await this.unitProgressService.findOneById(unitProgressId, ['unit']);

        const recommendedUnitAreas = [];
        for (const skill of weakSkills) {
            const unitAreas = await this.unitAreaService.findUnitAreasBySkillAndUnit(skill.id, unitProgress.unit.id);
            recommendedUnitAreas.push(...unitAreas);
        }

        return recommendedUnitAreas;
    }
}