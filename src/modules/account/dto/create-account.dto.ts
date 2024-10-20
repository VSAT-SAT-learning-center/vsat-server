import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Role } from 'src/database/entities/role.entity';

export class CreateAccountDTO {
    @IsNotEmpty()
    @ApiProperty({ example: 'Student' })
    role: string;

    @Expose()
    username: string;

    password: string;

    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    firstname: string;

    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    lastname: string;

    @IsNotEmpty()
    @Expose()
    @ApiProperty()
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
