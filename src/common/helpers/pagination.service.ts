import { Injectable } from '@nestjs/common';

@Injectable()
export class PaginationService {
  paginate<T>(
    items: T[],
    page: number,
    pageSize: number
  ): { data: T[], totalItems: number, totalPages: number } {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const data = items.slice(startIndex, startIndex + pageSize);

    return { data, totalItems, totalPages };
  }

  sort<T>(items: T[], sortBy: keyof T, sortOrder: 'ASC' | 'DESC'): T[] {
    return items.sort((a, b) => {
      if (sortOrder === 'ASC') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });
  }
}
