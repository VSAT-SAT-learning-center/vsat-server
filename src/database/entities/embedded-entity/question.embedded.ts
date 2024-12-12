import { Answer } from './answer.embedded';

export class Question {
    questionId: string;
    prompt: string;
    correctAnswer: string;
    answers: Answer[];
    explanation?: string;
}
