import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongoConfigService } from './config/mongo.config';
import { PostgresConfigService } from './config/postgres.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: PostgresConfigService,
    }),
  ],
  providers: [PostgresConfigService, MongoConfigService],
})
export class DatabaseModule {}
