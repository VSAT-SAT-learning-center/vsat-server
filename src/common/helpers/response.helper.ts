import { ResponseFormat } from "./dto/response.dto";

export class ResponseHelper {
    static success<T>(data: T, message: string = 'Success'): ResponseFormat<T> {
        return {
            success: true,
            data,
            message,
        };
    }

    static error(message: string, errorCode: string = 'UNKNOWN_ERROR'): ResponseFormat<null> {
        return {
            success: false,
            message,
            errorCode,
        };
    }
}