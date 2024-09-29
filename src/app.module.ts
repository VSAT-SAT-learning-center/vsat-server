import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UnitModule } from './modules/unit/unit.module';
import { LessonContentModule } from './modules/lesson-content/lesson-content.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { UnitAreaModule } from './modules/unit-area/unit-area.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UnitModule,
    UnitAreaModule,
    LessonModule,
    LessonContentModule,
  ],
})
export class AppModule {}
