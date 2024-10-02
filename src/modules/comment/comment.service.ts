import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { BaseService } from '../base/base.service';
import { Comment } from 'src/database/entities/comment.entity';

@Injectable()
export class CommentService extends BaseService<Comment> {
  constructor(
    @InjectRepository(Comment) repository: Repository<Comment>, // Use protected in BaseService
    paginationService: PaginationService,
  ) {
    super(repository, paginationService); // Pass the correct repository and paginationService to BaseService
  }
}
