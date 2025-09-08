import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsPositive } from 'class-validator'

export class PaginateDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty({ type: 'number', example: 1, required: false })
  page: number

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty({ type: 'number', example: 10, required: false })
  limit: number
}
