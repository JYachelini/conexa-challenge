import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity as TypeormBaseEntity,
} from 'typeorm'

export abstract class BaseEntity extends TypeormBaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @DeleteDateColumn()
  deleted_at: Date | null
}
