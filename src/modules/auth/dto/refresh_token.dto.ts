import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'

export class RefreshTokenDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string' })
  refresh_token: string
}
