import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class GetDomainDTO {
    @Expose()
    @ApiProperty()
    id: string;

    @Expose()
    @ApiProperty()
    content: string;
}

export class GetSkillDTO {
    @Expose()
    @ApiProperty()
    id: string;
    @Expose()
    @ApiProperty()
    content: string;
    @Expose()
    @ApiProperty({ type: GetDomainDTO })
    @Type(() => GetDomainDTO)
    domain: GetDomainDTO;
}
