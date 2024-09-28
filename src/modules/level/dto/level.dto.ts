import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class LevelDTO {
    @Expose()
    id: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;

    @Expose()
    @IsNotEmpty()
    status: boolean;
}
