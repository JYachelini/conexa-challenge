import { Column, Entity } from 'typeorm'
import { IUser } from '../interface/user.interface'
import { EnumRoles } from '../../auth/enum/roles.enum'
import { BaseEntity } from '../../database/entity/base.entity'

@Entity()
export class User extends BaseEntity implements IUser {
  @Column({ type: 'varchar', length: 50, nullable: false })
  username: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string

  @Column({ type: 'enum', enum: EnumRoles, nullable: false })
  role: EnumRoles

  @Column({ type: 'varchar', nullable: true, length: 255 })
  refresh_token_hash: string
}
