import { IsOptional, IsString, IsInt, Min, Max, IsIn, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationOptionsDto {
  
  @ApiPropertyOptional({
    description: 'Page number, minimum is 1',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)  // Đảm bảo rằng tham số 'page' sẽ được chuyển thành kiểu số
  @IsInt()
  @Min(1)
  page?: number;  // Giá trị mặc định là 1

  @ApiPropertyOptional({
    description: 'Number of items per page, minimum is 1 and maximum is 100',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;  // Giá trị mặc định là 10

  @ApiPropertyOptional({
    description: 'Field by which to sort the results',
    example: 'id',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'id';  // Trường mặc định để sắp xếp

  @ApiPropertyOptional({
    description: 'Sorting order, can be either ASC or DESC',
    example: 'ASC',
    enum: ['ASC', 'DESC']
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])  // Chỉ chấp nhận 'ASC' hoặc 'DESC'
  sortOrder?: 'ASC' | 'DESC' = 'ASC';  // Giá trị mặc định là 'ASC'

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relations?: string[] = []; //// Trường quan hệ tùy chọn để bao gồm các thực thể liên quan

  @IsOptional()
  @IsObject() 
  filter?: any; // Điều kiện để dynamic filtering
}
