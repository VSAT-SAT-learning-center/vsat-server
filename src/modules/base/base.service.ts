import { PaginationService } from 'src/common/helpers/pagination.service';
import { Repository, DeepPartial } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class BaseService<T> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly paginationService: PaginationService, // Inject PaginationService
  ) {}

  async findAll(
    options: any,
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = 'id', // Mặc định sắp xếp theo trường 'id'
    sortOrder: 'ASC' | 'DESC' = 'ASC',
  ): Promise<{ data: T[]; totalItems: number; totalPages: number }> {
    const items = await this.repository.find(options);

    // Sắp xếp items bằng PaginationService
    const sortedItems = this.paginationService.sort(items, sortBy, sortOrder);

    // Phân trang bằng PaginationService
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedItems,
      page,
      pageSize,
    );

    return { data, totalItems, totalPages };
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
