export class QuizQuestionAnswerDto {
    id: string; // answer ID
    label: string;
    text: string;
}

export class QuizQuestionItemDto {
    id: string; // question item ID
    quizquestion: {
        id: string; // quiz question ID
        content: string;
        answers: QuizQuestionAnswerDto[]; 
    };
}

export class QuizAttemptResponseDto {
    quizAttemptId: string;
    quizId: string;
    totalQuestions: number;
    questions: QuizQuestionItemDto[];
}