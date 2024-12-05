import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class GoogleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const email = request.body.email;

        if (!email || !email.includes('@')) {
            return false;
        }
        return true;
    }
}
