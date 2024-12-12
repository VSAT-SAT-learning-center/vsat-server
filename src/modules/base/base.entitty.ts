import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDate, IsOptional } from 'class-validator';
import { CreateDateColumn, UpdateDateColumn, Column } from 'typeorm';

export abstract class BaseEntity {
  @ApiProperty({ description: 'Người tạo bản ghi', example: 'f9b12345-6e78-9abc-def0-1234567890ab' })
  @IsUUID()
  @IsOptional()
  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @ApiProperty({ description: 'Người cập nhật bản ghi', example: 'a2d78910-bc12-3456-def0-0987654321bc' })
  @IsUUID()
  @IsOptional()
  @Column({ type: 'uuid', nullable: true })
  updatedBy?: string;

  @ApiProperty({ description: 'Ngày tạo bản ghi', example: '2023-10-08T07:23:34.000Z' })
  @IsDate()
  @CreateDateColumn({ type: 'timestamp' }) 
  createdOn: Date;

  @ApiProperty({ description: 'Ngày cập nhật bản ghi', example: '2023-10-09T10:14:12.000Z' })
  @IsDate()
  @UpdateDateColumn({ type: 'timestamp' }) 
  updatedOn: Date;
}
