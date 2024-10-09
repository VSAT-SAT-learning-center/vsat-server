import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Logger,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from '../helpers/response.helper';

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.message
                : 'Internal server error';

        const details =
            exception instanceof HttpException && exception.getResponse
                ? exception.getResponse()
                : null;

        // Log the detailed error for developers
        const logMessage = `
        Error: ${message}
        Status: ${status}
        URL: ${request.url}
        Method: ${request.method}
        IP: ${request.ip}
        User Agent: ${request.headers['user-agent']}
        Request Body: ${JSON.stringify(request.body)}
        Stack: ${exception instanceof HttpException ? exception.stack : (exception as Error)?.stack}
      `;
        this.logger.error(logMessage); // Log the error details

        // Use ResponseHelper for consistency
        return response.status(status).json(
            ResponseHelper.error(
                details, // You can pass more detailed information if available
                status,
                message, // Message from exception or fallback to default
            ),
        );
    }
}
