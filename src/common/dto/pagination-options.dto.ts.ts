import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationOptionsDto {
  @IsOptional()
  @Type(() => Number)  // Đảm bảo rằng tham số 'page' sẽ được chuyển thành kiểu số
  @IsInt()
  @Min(1)
  page?: number = 1;  // Giá trị mặc định là 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;  // Giá trị mặc định là 10

  @IsOptional()
  @IsString()
  sortBy?: string = 'id';  // Trường mặc định để sắp xếp

  @IsOptional()
  @IsIn(['ASC', 'DESC'])  // Chỉ chấp nhận 'ASC' hoặc 'DESC'
  sortOrder?: 'ASC' | 'DESC' = 'ASC';  // Giá trị mặc định là 'ASC'
}
