import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsBooleanString, IsOptional } from 'class-validator'

export class GetMovieQueryDto {
  @Expose()
  @IsBooleanString()
  @IsOptional()
  @ApiProperty({ type: 'boolean', required: false })
  extended?: boolean
}
