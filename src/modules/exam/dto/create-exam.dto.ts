import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateExamDto {
  
  @ApiProperty({
    description: 'ID của cấu trúc đề thi',
    example: '9ca8866b-ffb5-44fe-8cb1-8ad037bae4ae',
  })
  @IsUUID()
  @Expose()
  examStructureId: string;

  @ApiProperty({
    description: 'ID của loại đề thi',
    example: '49b5d7f2-edad-4b46-a5a8-02c77de6ea9a',
  })
  @IsUUID()
  @Expose()
  examTypeId: string;

  @ApiProperty({
    description: 'Tiêu đề của đề thi',
    example: 'Đề thi kiểm tra Toán học',
  })
  @IsString()
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Mô tả của đề thi (tùy chọn)',
    example: 'Đề thi kiểm tra kiến thức Toán học lớp 10',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Trạng thái của đề thi (tùy chọn)',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
