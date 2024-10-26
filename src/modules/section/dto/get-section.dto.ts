import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class GetSectionDto {
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
}
