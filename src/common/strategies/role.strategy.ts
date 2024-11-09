import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoleStrategy extends PassportStrategy(Strategy, 'role') {
    constructor() {
        super({
          
        });
    }

    async validate(payload: any) {
        return { id: payload.id, username: payload.username, role: payload.role };
    }
}
