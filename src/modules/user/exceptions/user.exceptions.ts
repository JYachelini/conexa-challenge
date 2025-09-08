import { ConflictException, NotFoundException } from '@nestjs/common'

export class UserExistsException extends ConflictException {
  constructor() {
    super('Username already exists.')
  }
}

export class UserNotFound extends NotFoundException {
  constructor() {
    super('User not found.')
  }
}
