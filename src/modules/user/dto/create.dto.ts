import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty({ type: 'string', minLength: 3, example: 'user' })
  username: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({ type: 'string', minLength: 6, example: 'user123' })
  password: string
}
