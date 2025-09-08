import { IBaseEntity } from '../../database/interface/base.interface'

export interface IMovie extends IBaseEntity {
  external_id: string | null
  external_description: string | null

  episode_id: number | null

  created: Date | null
  edited: Date | null

  opening_crawl: string | null

  director: string | null
  producer: string | null
  release_date: string | null
  title: string | null
  url: string | null

  admin_updated: boolean
  admin_updated_at: Date | null
  admin_updated_by: number | null
}
