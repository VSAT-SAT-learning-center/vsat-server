import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongoConfigService } from './config/mongo.config';
import { PostgresConfigService } from './config/postgres.config';

@Module({
  imports: [
    // PostgreSQL configuration via TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: PostgresConfigService,
    }),

    // MongoDB configuration via Mongoose
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useClass: MongoConfigService,
    // }),
  ],
  providers: [PostgresConfigService, MongoConfigService],
})
export class DatabaseModule {}
