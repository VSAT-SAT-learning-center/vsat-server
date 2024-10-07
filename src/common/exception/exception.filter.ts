import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: (exception instanceof HttpException) ? exception.message : 'Internal server error',
    };

    // Ghi log chi tiết về lỗi cho dev
    const logMessage = `
      Error: ${errorResponse.message}
      Status: ${status}
      URL: ${request.url}
      Method: ${request.method}
      IP: ${request.ip}
      User Agent: ${request.headers['user-agent']}
      Request Body: ${JSON.stringify(request.body)}
      Stack: ${(exception instanceof HttpException) ? exception.stack : (exception as Error)?.stack}
    `;
    
    this.logger.error(logMessage);  // Ghi log chi tiết để giúp dev fix bug
    
    response.status(status).json(errorResponse);
  }
}
