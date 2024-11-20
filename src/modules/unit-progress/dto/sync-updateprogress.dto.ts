import { ApiProperty } from '@nestjs/swagger';
import { ProgressStatus } from 'src/common/enums/progress-status.enum';

export class UnitProgressDto {
    @ApiProperty({ description: 'ID of the unit', example: 'unit-123' })
    unitId: string;
}

export class SyncUnitProgressDto {
    @ApiProperty()
    sectionId: string;

    @ApiProperty()
    targetLearningId: string;

    @ApiProperty({
        description: 'Array of unit progress details',
        type: [UnitProgressDto],
    })
    unitProgresses: UnitProgressDto[];
}
