export class QuizQuestionAnswerDto {
    id: string;
    label: string;
    text: string;
}

export class QuizQuestionItemDto {
    id: string;
    quizquestion: {
        id: string;
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