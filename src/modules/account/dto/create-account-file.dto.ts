import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateAccountFromFileDTO {
    @IsNotEmpty()
    @ApiProperty({ example: 'Student' }) // Thêm mô tả cho Swagger
    role: string;

    @Expose()
    username: string;

    password: string;

    @ApiProperty()
    @Expose()
    firstname: string;

    @ApiProperty()
    @Expose()
    lastname: string;

    @IsNotEmpty()
    @ApiProperty()
    @Expose()
    email: string;
}
