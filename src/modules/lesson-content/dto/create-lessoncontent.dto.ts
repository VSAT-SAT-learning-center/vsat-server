import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsString, IsUUID, IsOptional, IsNotEmpty, IsInt, IsBoolean, IsEnum, ValidateNested } from 'class-validator';
import { ContentType } from 'src/common/enums/content-type.enum';
import { CreateContentDto } from './create-content.dto';
import { CreateQuestionDto } from './create-question.dto';

export class CreateLessonContentDto {
  @ApiProperty({
    example: '45dc7a26-e7a0-414e-b7fb-1b30d255cecf',
  })
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  sort?: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({
    enum: ContentType,
    enumName: 'ContentType',
    example: ContentType.APPLICATION,
    required: false,
  })
  @IsEnum(ContentType)
  @IsOptional()
  @Transform(({ value }) => value)
  contentType: ContentType;

  @ApiProperty({ type: [CreateContentDto], description: 'Array of content objects' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateContentDto)
  contents: CreateContentDto[];

  @ApiProperty({ type: [CreateQuestionDto], description: 'Array of question objects',})
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => CreateQuestionDto)
  question?: CreateQuestionDto | null;
}
