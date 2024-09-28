export class ResponseFormat<T> {
    success: boolean;
    data?: T;
    message: string;
    errorCode?: string;
}
