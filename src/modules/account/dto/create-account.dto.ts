import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Role } from 'src/database/entities/role.entity';

export class CreateAccountDTO {
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID of the lesson',
        example: '2a5d4171-fc32-4155-834e-6d6e4ed021ef',
    })
    @IsUUID()
    roleId: string;

    @IsNotEmpty()
    @Expose()
    @ApiProperty()
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
