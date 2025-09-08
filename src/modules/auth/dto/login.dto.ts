import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', example: 'admin' })
  username: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', example: 'admin123' })
  password: string
}

export class LoginResponseDto {
  @Expose()
  @ApiProperty({ type: 'string' })
  access_token: string

  @Expose()
  @ApiProperty({ type: 'string' })
  refresh_token: string
}
