import { Answer } from './answer.embedded';

// question.embedded.ts
export class Question {
    questionId: string;
    prompt: string;
    correctAnswer: string;
    answers: Answer[];
    explanation?: string;
}
