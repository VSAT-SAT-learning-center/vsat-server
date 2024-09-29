export class ResponseFormat<T> {
    statusCode: number;
    success: boolean;
    data?: T;
    message: string;
    errorCode?: string;
    details?: any;
}
