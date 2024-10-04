import { Expose } from 'class-transformer';

export class GetAnswerDTO {
    @Expose()
    id: string; // ID của câu trả lời

    @Expose()
    label: string; // Nhãn của câu trả lời (A, B, C, D)

    @Expose()
    text: string; // Nội dung của câu trả lời
}
