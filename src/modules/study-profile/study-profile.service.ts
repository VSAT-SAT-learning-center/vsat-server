import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudyProfileDto } from './dto/create-studyprofile.dto';
import { UpdateStudyProfileDto } from './dto/update-studyprofile.dto';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { BaseService } from '../base/base.service';

@Injectable()
export class StudyProfileService extends BaseService<StudyProfile> {
  constructor(
    @InjectRepository(StudyProfile)
    private readonly studyProfileRepository: Repository<StudyProfile>,
  ) {
    super(studyProfileRepository);
  }

  async suggestedRoute(){
    
  }

}
