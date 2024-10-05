import { PaginationService } from 'src/common/helpers/pagination.service';
import { Repository, DeepPartial } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class BaseService<T> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly paginationService: PaginationService, // Inject PaginationService
  ) {}

  async findAll(
    paginationOptions: PaginationOptionsDto
  ): Promise<{ data: T[]; totalItems: number; totalPages: number }> {
    
    const { filter, page, pageSize, sortBy, sortOrder, relations } = paginationOptions;

    const [items, totalItems] = await this.repository.findAndCount({
      where: filter,
      order: { [sortBy]: sortOrder } as FindManyOptions<T>['order'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations, // Lấy quan hệ liên quan
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    return { data: items, totalItems, totalPages };

  }

  async findOne(id: string | number): Promise<T | undefined> {
    return this.repository.findOne({ where: { id } as any });
  }

  async create(entity: DeepPartial<T>): Promise<T> {
    const newEntity = this.repository.create(entity);
    return this.repository.save(newEntity);
  }

  async update(id: string | number, entity: QueryDeepPartialEntity<T>): Promise<T | undefined> {
    await this.repository.update(id, entity);
    return this.findOne(id);
  }
  //QueryDeepPartialEntity<T>: Đây là kiểu đặc biệt được sử dụng cho các thao tác cập nhật trong TypeORM. 
  //Nó đảm bảo rằng bạn có thể cập nhật một phần của thực thể mà không gặp phải vấn đề tương thích kiểu.

  async remove(id: string | number): Promise<void> {
    await this.repository.delete(id);
  }
}
