import { Reflector } from '@nestjs/core'
import { EnumRoles } from '../../../enum/roles.enum'

export const Roles = Reflector.createDecorator<EnumRoles[]>()
