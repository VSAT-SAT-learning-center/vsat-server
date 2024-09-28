import { Quiz } from 'src/database/entities/quiz.entity';
import { Skill } from 'src/database/entities/skill.entity';

export class QuizQuestionDTO {
    id: string;

    skill: Skill;

    quiz: Quiz;

    content: string;

    answer1: string;

    answer2: string;

    answer3: string;

    answer4: string;

    correctoption: number;

    correctanswer: string;

    explain: string;

    sort: number;

    status: boolean;
}
