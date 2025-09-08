import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IMovie } from '../interface/movie.interface'
import { IsDefined, IsISO8601, IsNotEmpty, IsNumber, IsPositive, IsString, IsUrl } from 'class-validator'
import { Expose } from 'class-transformer'
import { IMovieProperties } from '../interface/api.response'

type IMovieResponseDto = Pick<
  IMovie,
  | 'id'
  | 'episode_id'
  | 'created'
  | 'edited'
  | 'opening_crawl'
  | 'director'
  | 'producer'
  | 'release_date'
  | 'title'
  | 'url'
>

export class CreateMovieDto {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', example: 'opnening crawl amazing movie' })
  opening_crawl: string

  @IsString()
  @IsDefined()
  @Expose()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', example: 'Julian' })
  director: string

  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', example: 'Producer' })
  producer: string

  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsISO8601()
  @ApiProperty({ type: 'string', example: '2005-05-16' })
  release_date: string

  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', example: 'Attack of the Clones' })
  title: string

  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsUrl()
  @ApiProperty({ type: 'string', example: 'swapi.tech' })
  url: string

  @Expose()
  @IsNumber()
  @IsPositive()
  @ApiProperty({ type: 'number', example: 10 })
  episode_id: number
}

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}

export class MovieResponseDto extends CreateMovieDto implements IMovieResponseDto {
  @Expose()
  @ApiProperty({ type: 'number', example: 1 })
  id: number

  @Expose()
  @ApiProperty({ type: 'string', example: new Date() })
  created: Date

  @Expose()
  @ApiProperty({ type: 'string', example: new Date() })
  edited: Date
}

export class MovieDetailResponseDto extends MovieResponseDto implements IMovieProperties {
  @Expose()
  @ApiProperty({ type: 'string', isArray: true, example: [] })
  starships: string[]

  @Expose()
  @ApiProperty({ type: 'string', isArray: true, example: [] })
  vehicles: string[]

  @Expose()
  @ApiProperty({ type: 'string', isArray: true, example: [] })
  planets: string[]

  @Expose()
  @ApiProperty({ type: 'string', isArray: true, example: [] })
  characters: string[]

  @Expose()
  @ApiProperty({ type: 'string', isArray: true, example: [] })
  species: string[]
}
