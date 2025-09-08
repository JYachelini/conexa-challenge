export interface IMovieProperties {
  created: Date
  edited: Date
  starships: string[]
  vehicles: string[]
  planets: string[]
  producer: string
  title: string
  episode_id: number
  director: string
  release_date: string
  opening_crawl: string
  characters: string[]
  species: string[]
  url: string
}

export interface IMovieResult {
  properties: IMovieProperties
  uid: string
  description: string
}

export interface IStarwarsApiResponse {
  message: 'ok'
  result: IMovieResult[]
}

export interface IStarwarsApiDetailResponse {
  message: 'ok'
  result: IMovieResult
}
