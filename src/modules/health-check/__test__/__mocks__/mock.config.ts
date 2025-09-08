import { ConfigType } from '@nestjs/config'
import { environments } from '../../../config/env.config'

export const mockConfig = {
  /*eslint-disable-next-line*/
  APP_VERSION: '1.2.3',
} as ConfigType<typeof environments>
