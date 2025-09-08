import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsDefined, IsNotEmpty } from 'class-validator'
import { IBatchResult, IResponseSyncMovies } from '../interface/response.interace'
import { Expose } from 'class-transformer'

export class SyncMoviesDto {
  @Expose()
  @IsBoolean()
  @IsDefined()
  @IsNotEmpty()
  @ApiPropertyOptional({ type: 'boolean', example: false })
  force_update: boolean
}

export class BatchResultDto implements IBatchResult {
  @Expose()
  @ApiProperty({ type: 'number', example: 1 })
  batch: number

  @Expose()
  @ApiProperty({ type: 'boolean', example: true })
  success: boolean
}

export class SyncMoviesResponseDto implements IResponseSyncMovies {
  @Expose()
  @ApiProperty({ type: 'number', example: 6 })
  created: number

  @Expose()
  @ApiProperty({ type: 'number', example: 0 })
  updated: number

  @Expose()
  @ApiProperty({ type: 'number', example: 0 })
  skipped: number

  @Expose()
  @ApiProperty({ type: 'number', example: 0 })
  errors: number

  @Expose()
  @ApiProperty({ type: BatchResultDto, example: () => BatchResultDto })
  batchResults: BatchResultDto[]
}
