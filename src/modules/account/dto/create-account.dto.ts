import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Role } from 'src/database/entities/role.entity';

export class CreateAccountDTO {
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID of the lesson',
        example: '2bb9ffe7-6b62-43ef-b144-5392a46068c7',
    })
    @IsUUID()
    roleId: string;

    @Expose()
    username: string;

    password: string;

    @Expose()
    @ApiProperty()
    firstname: string;

    @Expose()
    @ApiProperty()
    lastname: string;

    @IsNotEmpty()
    @Expose()
    @ApiProperty()
    email: string;
}
