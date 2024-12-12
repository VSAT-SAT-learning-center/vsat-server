import { PagingDto } from "./paging.dto";
import { SortingDto } from "./sorting.dto";

export class ResponseFormat<T> {
    statusCode: number;
    success: boolean;
    data?: T;
    message: string;
    errorCode?: string;
    details?: any;
    paging?: PagingDto; 
    sorting?: SortingDto; 
}
