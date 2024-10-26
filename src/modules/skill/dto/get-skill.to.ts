import { Expose, Type } from 'class-transformer';

export class GetDomainDTO {
    @Expose()
    id: string;

    @Expose()
    content: string;
}

export class GetSkillDTO {
    @Expose()
    id: string;
    @Expose()
    content: string;
    @Expose()
    @Type(() => GetDomainDTO)
    domain: GetDomainDTO;
}
