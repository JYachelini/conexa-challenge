import { Reflector } from '@nestjs/core'
import { EnumRoles } from 'src/modules/auth/enum/roles.enum'

export const Roles = Reflector.createDecorator<EnumRoles[]>()
