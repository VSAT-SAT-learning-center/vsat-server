import { HttpStatus } from "@nestjs/common";
import { ResponseFormat } from "./dto/response.dto";

export class ResponseHelper {
    static success<T>(statusCode: HttpStatus, data: T, message: string = 'Success'): ResponseFormat<T> {
        return {
            statusCode,
            success: true,
            data,
            message,
        };
    }

    static error(statusCode: HttpStatus, message: string, errorCode: string = 'UNKNOWN_ERROR'): ResponseFormat<null> {
        return {
            statusCode,
            success: false,
            message,
            errorCode,
        };
    }
}