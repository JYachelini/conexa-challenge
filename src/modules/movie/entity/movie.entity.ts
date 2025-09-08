import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { BaseEntity } from '../../database/entity/base.entity'
import { IMovie } from '../interface/movie.interface'
import { User } from '../../user/entity/user.entity'

@Entity()
@Unique(['external_id'])
export class Movie extends BaseEntity implements IMovie {
  @Column({ type: 'varchar', length: 100, nullable: true })
  external_id: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  external_description: string | null

  @Column({ type: 'date', nullable: true })
  created: Date | null

  @Column({ type: 'date', nullable: true })
  edited: Date | null

  @Column({ type: 'text', nullable: true })
  opening_crawl: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  director: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  producer: string | null

  @Column({ type: 'varchar', length: 20, nullable: true })
  release_date: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  url: string | null

  @Column({ type: 'integer', nullable: true })
  episode_id: number | null

  @Column({ type: 'boolean', default: false })
  admin_updated: boolean

  @Column({ type: 'timestamp', nullable: true })
  admin_updated_at: Date | null

  @JoinColumn({ name: 'admin_updated_by' })
  @ManyToOne(() => User)
  admin_updated_by: number | null
}
