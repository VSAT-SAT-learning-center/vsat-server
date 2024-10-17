import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateAccountFromFileDTO {
    @IsNotEmpty()
    @ApiProperty({ example: 'Student' })
    role: string;

    @Expose()
    username: string;

    password: string;

    @ApiProperty()
    @Expose()
    @IsNotEmpty()
    firstname: string;

    @ApiProperty()
    @Expose()
    @IsNotEmpty()
    lastname: string;

    @IsNotEmpty()
    @ApiProperty()
    @Expose()
    email: string;

    @IsNotEmpty()
    @ApiProperty()
    @Expose()
    gender: boolean;

    @IsNotEmpty()
    @ApiProperty()
    @Expose()
    dateofbirth: string;

    @IsNotEmpty()
    @ApiProperty()
    @Expose()
    phonenumber: string;
}
