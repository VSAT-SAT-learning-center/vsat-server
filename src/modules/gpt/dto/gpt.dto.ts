import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteInputDTO {
    @ApiProperty({
        example:
            'Câu hỏi: Nếu x = 5 và y = 10, thì tổng của x và y là bao nhiêu? Đáp án: 15',
    })
    @IsString()
    @IsNotEmpty()
    message: string;
}

export class CompleteOutputDTO {
    @IsString()
    @IsNotEmpty()
    aiMessage: string;

    static getInstance(aiMessage: string) {
        const result = new CompleteOutputDTO();
        result.aiMessage = aiMessage;
        return result;
    }
}
