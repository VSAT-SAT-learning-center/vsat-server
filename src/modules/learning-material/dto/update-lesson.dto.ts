import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateLessonDto {
    @ApiProperty({
        example: '0ecf1ec5-bf42-4c51-8e74-3546f2cfd91f',
        required: true
      })
      @IsUUID()
      @IsNotEmpty()
      id: string; 
    
      @ApiProperty({ required: false })
      @IsString()
      @IsOptional()
      title?: string; 
}