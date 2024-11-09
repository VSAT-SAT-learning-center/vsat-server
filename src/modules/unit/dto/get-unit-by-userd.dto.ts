import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitStatus } from 'src/common/enums/unit-status.enum';

export class GetUnitsByUserIdDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    userId: string;

    @ApiPropertyOptional({
        example: 'Math Unit',
        description: 'Filter by name',
    })
    name?: string;

    @ApiPropertyOptional({ example: UnitStatus.DRAFT })
    status?: UnitStatus;

    @ApiPropertyOptional({
        example: '2024-10-01T00:00:00.000Z',
        description: 'Filter by createdAt date',
    })
    createdAt?: Date;

    @ApiPropertyOptional({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Filter by section',
    })
    sectionId?: string;

    @ApiPropertyOptional({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Filter by level',
    })
    levelId?: string;

    @ApiPropertyOptional({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Filter by level',
    })
    domainId?: string;
}
