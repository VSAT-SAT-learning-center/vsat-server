import { Expose } from 'class-transformer';

export class GetSkillDTO {
    @Expose()
    id: string;
    @Expose()
    content: string;
}
