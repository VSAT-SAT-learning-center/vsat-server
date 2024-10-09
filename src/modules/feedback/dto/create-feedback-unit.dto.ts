import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CreateFeedbackUnitDto {
  @ApiProperty()
  @IsUUID()
  unitId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsUUID()
  accountId: string;
}
