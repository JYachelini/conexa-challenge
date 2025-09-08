import { ApiProperty } from '@nestjs/swagger'
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
