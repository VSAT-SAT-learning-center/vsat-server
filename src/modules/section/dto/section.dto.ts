import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class SectionDTO extends BaseDTO {
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
