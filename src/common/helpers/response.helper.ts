import { HttpStatus } from "@nestjs/common";
import { ResponseFormat } from "./dto/response.dto";
import { HttpStatusMessages } from "../constants/error-messages";

export class ResponseHelper {
    static success<T>(statusCode: HttpStatus, data: T, message: string = 'Success'): ResponseFormat<T> {
        return {
            statusCode,
            success: true,
            data,
            message,
        };
    }

    static error(
        error: any,
        statusCode: HttpStatus,
        message: string,
      ): ResponseFormat<null> {
        const details = error.details || null;

        const defaultMessage = HttpStatusMessages[statusCode]?.(message) || 'An error occurred';
        return {
          statusCode,
          success: false,
          message: defaultMessage,
          details,
        };
      }
}