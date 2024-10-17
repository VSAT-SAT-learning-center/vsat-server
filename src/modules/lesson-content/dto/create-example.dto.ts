import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateExampleDto {
  @ApiProperty({ example: '1', description: 'ID of the example' })
  @IsString()
  @IsNotEmpty()
  exampleId: string;

  @ApiProperty({ example: 'This is an example content', description: 'Content of the example' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'This is the explanation of the example', description: 'Explanation of the example' })
  @IsString()
  @IsOptional()
  explain?: string;
}
