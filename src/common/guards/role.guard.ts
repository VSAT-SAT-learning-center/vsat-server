import {
    ExecutionContext,
    Injectable,
    CanActivate,
    ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly roles: string[]) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role) {
            throw new ForbiddenException('User not authenticated');
        }

        const hasRole = this.roles.includes(user.role.toLowerCase());
        if (!hasRole) {
            throw new ForbiddenException('User does not have the necessary permissions');
        }
        return hasRole;
    }
}
