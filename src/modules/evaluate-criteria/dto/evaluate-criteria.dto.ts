import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class EvaluateCriteriaResponseDto {
    @ApiProperty({
        example: '1d24f4d3-3b41-45e2-828f-d7ad72f0a2a8',
        description: 'Unique ID of the criteria',
    })
    @Expose()
    id: string;

    @ApiProperty({ example: 'Academic Performance', description: 'Criterion name' })
    @Expose()
    name: string;

    @ApiProperty({
        example: 'Evaluation based on academic results',
        description: 'Description of the criteria',
        required: false,
    })
    @Expose()
    description?: string;

    @ApiProperty({
        example: 'Student',
        enum: ['Student', 'Teacher'],
        description: 'Applicable role for the criteria',
    })
    @Expose()
    applicableTo: 'Student' | 'Teacher';
}
