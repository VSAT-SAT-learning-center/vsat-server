import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction, Request } from 'express';
import { RequestContext } from '../context/request-context';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const context = new Map<string, any>();

        RequestContext.run(context, () => {
            next();
        });
    }
}
