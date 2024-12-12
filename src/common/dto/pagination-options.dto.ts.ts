import { IsOptional, IsString, IsInt, Min, Max, IsIn, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationOptionsDto {
  
  @ApiPropertyOptional({
    description: 'Page number, minimum is 1',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)  
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page, minimum is 1 and maximum is 100',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({
    description: 'Field by which to sort the results',
    example: 'id',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sorting order, can be either ASC or DESC',
    example: 'ASC',
    enum: ['ASC', 'DESC']
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])  
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relations?: string[] = []; 

}
