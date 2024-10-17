import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsUUID, IsOptional, IsInt, IsBoolean, IsEnum } from 'class-validator';
import { ContentType } from 'src/common/enums/content-type.enum';

export class UpdateLessonContentDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  lessonId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;

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
}
