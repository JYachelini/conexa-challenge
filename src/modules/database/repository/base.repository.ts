import { Injectable } from '@nestjs/common'
import { BaseEntity, EntityManager, EntityTarget, Repository } from 'typeorm'

@Injectable()
export abstract class BaseRepository<T extends BaseEntity> extends Repository<T> {
  constructor(target: EntityTarget<T>, manager: EntityManager) {
    super(target, manager)
  }
}
