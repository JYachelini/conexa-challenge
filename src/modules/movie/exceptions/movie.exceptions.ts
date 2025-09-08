import { NotFoundException } from '@nestjs/common'

export class MovieNotFoundException extends NotFoundException {
  constructor() {
    super('Movie not found with given id.')
  }
}
