import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { AuditSubscriber } from 'src/common/subscriber/audit.subscriber';

@Injectable()
export class PostgresConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('POSTGRES_HOST'),
      port: this.configService.get<number>('POSTGRES_PORT'),
      username: this.configService.get<string>('POSTGRES_USER'),
      password: this.configService.get<string>('POSTGRES_PASSWORD'),
      database: this.configService.get<string>('POSTGRES_DB'),
      entities: [__dirname + '/../entities/*.entity.{ts,js}'],
      synchronize: this.configService.get<boolean>('POSTGRES_SYNC', true), // Disable in production
      logging: this.configService.get<boolean>('POSTGRES_LOGGING', true),
      retryAttempts: this.configService.get<number>('POSTGRES_RETRY_ATTEMPTS'),
      retryDelay: this.configService.get<number>('POSTGRES_RETRY_DELAY'),
      subscribers: [AuditSubscriber],
    };
  }
}
