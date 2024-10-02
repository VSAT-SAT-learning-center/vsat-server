import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.account', 'account')
      .leftJoinAndSelect('comment.lesson', 'lesson')
      .orderBy(`comment.${sortBy}`, sortOrder)
      .skip(skip)
      .take(pageSize);

    const [data, totalItems] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  async findOne(id: string) {
    return await this.commentRepository.findOne({ 
      relations: ['account', 'lesson'] 
    });
  }

  async create(createCommentDto: CreateCommentDto) {
    const comment = this.commentRepository.create(createCommentDto);
    return await this.commentRepository.save(comment);
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    await this.commentRepository.update(id, updateCommentDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.commentRepository.delete(id);
    return { deleted: true };
  }
}
