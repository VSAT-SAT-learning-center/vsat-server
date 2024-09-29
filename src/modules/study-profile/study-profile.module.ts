import { Module } from '@nestjs/common';
import { StudyProfileService } from './study-profile.service';
import { StudyProfileController } from './study-profile.controller';

@Module({
  providers: [StudyProfileService],
  controllers: [StudyProfileController]
})
export class StudyProfileModule {}
