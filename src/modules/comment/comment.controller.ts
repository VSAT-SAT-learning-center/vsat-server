import { Controller } from '@nestjs/common';
import { CommentService } from './comment.service';
import { BaseController } from '../base/base.controller';
import { ApiTags } from '@nestjs/swagger';
import { Comment } from 'src/database/entities/comment.entity';

@ApiTags('Comments')
@Controller('comments')
export class CommentController extends BaseController<Comment> {
  constructor(commentService: CommentService) {
    super(commentService, 'Comment'); // Use commentService directly in the constructor
  }
}
