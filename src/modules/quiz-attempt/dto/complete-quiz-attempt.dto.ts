import { ApiProperty } from '@nestjs/swagger';

export class CompleteQuizAttemptDto {
    @ApiProperty({ description: 'ID của hồ sơ học tập của học sinh', example: 'studyProfileId' })
    studyProfileId: string;

    @ApiProperty({
        description: 'Danh sách các câu trả lời của học sinh cho từng câu hỏi',
        type: Array,
        example: [
            {
                questionId: 'questionId1',
                selectedAnswerId: 'answerId1',
            },
            {
                questionId: 'questionId2',
                selectedAnswerId: 'answerId2',
            },
        ],
    })
    answers: Array<{
        questionId: string;
        selectedAnswerId: string;
    }>;
}
