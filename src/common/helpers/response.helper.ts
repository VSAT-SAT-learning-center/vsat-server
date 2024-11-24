import { HttpStatus } from '@nestjs/common';
import { ResponseFormat } from '../dto/response.dto';
import { HttpStatusMessages } from '../message/error-messages';
import { PagingDto } from '../dto/paging.dto';
import { SortingDto } from '../dto/sorting.dto';

export class ResponseHelper {
    static success<T>(
        statusCode: HttpStatus,
        data: T,
        message: string = 'Success',
        paging?: PagingDto, // Phân trang tùy chọn
        sorting?: SortingDto, // Sắp xếp tùy chọn
    ): ResponseFormat<T> {
        return {
            statusCode,
            success: true,
            data,
            message,
            paging, // Thông tin phân trang (nếu có)
            sorting, // Thông tin sắp xếp (nếu có)
        };
    }

    static error(
        error: any,
        statusCode: HttpStatus,
        message: string,
    ): ResponseFormat<null> {
        const details = error.details || null;

        const defaultMessage =
            HttpStatusMessages[statusCode]?.(message) || 'An error occurred';
        return {
            statusCode,
            success: false,
            message: defaultMessage,
            details: error || null,
        };
    }
}
