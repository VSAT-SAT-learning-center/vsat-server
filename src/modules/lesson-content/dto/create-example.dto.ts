import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateExampleDto {
  @ApiProperty({ example: '1', description: 'ID of the example' })
  @IsString()
  @IsOptional()
  exampleId?: string;

  @ApiProperty({ example: 'This is an example content', description: 'Content of the example' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ example: 'This is the explanation of the example', description: 'Explanation of the example' })
  @IsString()
  @IsOptional()
  explain?: string;
}
