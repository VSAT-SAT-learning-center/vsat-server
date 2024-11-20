import { ApiProperty } from '@nestjs/swagger';
import { ProgressStatus } from 'src/common/enums/progress-status.enum';

export class UnitProgressDto {
    @ApiProperty({ description: 'ID of the unit', example: 'unit-123' })
    unitId: string;

    @ApiProperty({
        description: 'Progress percentage (0-100)',
        example: 50,
        type: Number,
    })
    progress: number;

    @ApiProperty({
        description: 'Progress status',
        enum: ['Not Started', 'In Progress', 'Completed', 'Abandoned'],
        example: 'In Progress',
    })
    status: ProgressStatus;
}

export class SyncUnitProgressDto {
    @ApiProperty({
        description: 'ID of the target learning detail',
        example: 'target-learning-detail-123',
    })
    targetLearningDetailId: string;

    @ApiProperty({
        description: 'Array of unit progress details',
        type: [UnitProgressDto],
    })
    unitProgresses: UnitProgressDto[];
}
