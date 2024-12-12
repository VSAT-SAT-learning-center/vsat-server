import { HttpStatus } from '@nestjs/common';
import { ResponseFormat } from '../dto/response.dto';
import { PagingDto } from '../dto/paging.dto';
import { SortingDto } from '../dto/sorting.dto';
import { HttpStatusMessages } from '../message/error-messages';

export class ResponseHelper {
    static success<T>(
        statusCode: HttpStatus,
        data: T,
        message: string = 'Success',
        paging?: PagingDto, 
        sorting?: SortingDto, 
    ): ResponseFormat<T> {
        return {
            statusCode,
            success: true,
            data,
            message,
            paging, 
            sorting, 
        };
    }

    static error(
        error: any,
        statusCode: HttpStatus,
        message: string,
    ): ResponseFormat<null> {

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
