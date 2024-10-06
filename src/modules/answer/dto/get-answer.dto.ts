import { Expose } from 'class-transformer';

export class GetAnswerDTO {
    @Expose()
    id: string;

    @Expose()
    label: string;

    @Expose()
    text: string;

    
}
