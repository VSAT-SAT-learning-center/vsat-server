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
    firstname: string;

    @ApiProperty()
    @Expose()
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
    dateofbirth: Date;

    @IsNotEmpty()
    @ApiProperty()
    @Expose()
    phonenumber: string;
}
