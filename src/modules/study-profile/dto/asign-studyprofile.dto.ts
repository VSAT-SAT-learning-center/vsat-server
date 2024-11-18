import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsUUID, IsString, ValidateNested, ArrayNotEmpty } from 'class-validator';

export class StudyProfile {
    @ApiProperty()
    @Expose()
    @IsUUID()
    studyProfileId: string;
}

export class AssignStudyProfile {
    @ApiProperty()
    @Expose()
    @IsUUID()
    teacherId: string;

    @ApiProperty({
        type: [StudyProfile],
    })
    @Expose()
    @Type(() => StudyProfile)
    studyProfiles: StudyProfile[];
}
