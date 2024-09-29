import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';

export class SectionDTO {
    @Expose()
    id: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    description: string;

    @Expose()
    @IsNotEmpty()
    status: boolean;
}
