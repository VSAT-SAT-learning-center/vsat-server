import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Account } from 'src/database/entities/account.entity';
import { Lesson } from 'src/database/entities/lesson.entity';
import { Comment } from 'src/database/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Account, Lesson])],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
