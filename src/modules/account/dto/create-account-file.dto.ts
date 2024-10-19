import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateAccountFromFileDTO {
    @IsNotEmpty()
    @ApiProperty({ example: 'Student' })
    role: string;

    @Expose()
    username: string;

    password: string;

    @ApiProperty()
    @Expose()
    @IsNotEmpty({ message: 'First name should not be empty' })
    firstname: string;

    @ApiProperty()
    @Expose()
    @IsNotEmpty({ message: 'Last name should not be empty' })
    lastname: string;

    @IsNotEmpty()
    @IsEmail({}, { message: 'Email is not valid' })
    @ApiProperty()
    @Expose()
    email: string;

    @IsNotEmpty({ message: 'Gender should not be empty' })
    @ApiProperty()
    @Expose()
    gender: boolean;

    @IsNotEmpty({ message: 'Date of birth should not be empty' })
    @ApiProperty()
    @Expose()
    dateofbirth: string;

    @IsNotEmpty({ message: 'Phone number should not be empty' })
    @ApiProperty()
    @Expose()
    phonenumber: string;
}
