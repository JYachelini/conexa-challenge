import { IMovie } from '../../interface/movie.interface'
import { IMovieProperties } from '../../interface/api.response'
import { mockMovieEntity, mockMovieEntityAdminUpdated } from './movie.mock'

export const mockMovieService = {
  updateMovieByAdmin: jest.fn().mockImplementation((_: number, updateData: any, __: number): Promise<IMovie> => {
    return Promise.resolve({ ...mockMovieEntity, ...updateData, admin_updated: true })
  }),

  find: jest.fn().mockImplementation((_: number = 1, __: number = 10): Promise<IMovie[]> => {
    return Promise.resolve([mockMovieEntity, mockMovieEntityAdminUpdated])
  }),

  findById: jest.fn().mockImplementation((_: number, extended: boolean = false): Promise<IMovie | IMovieProperties> => {
    if (extended) {
      return Promise.resolve({
        ...mockMovieEntity,
        characters: ['https://swapi.dev/api/people/1/'],
        planets: ['https://swapi.dev/api/planets/1/'],
        starships: ['https://swapi.dev/api/starships/2/'],
        vehicles: ['https://swapi.dev/api/vehicles/4/'],
        species: ['https://swapi.dev/api/species/1/'],
      })
    }
    return Promise.resolve(mockMovieEntity)
  }),

  create: jest.fn().mockImplementation((createMovieDto: any, adminId: number): Promise<IMovie> => {
    return Promise.resolve({
      ...createMovieDto,
      id: 1,
      admin_updated: true,
      admin_updated_at: new Date(),
      admin_updated_by: adminId,
      external_description: null,
      external_id: null,
      created: null,
      edited: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    })
  }),

  delete: jest.fn().mockImplementation((_: number, __: number): Promise<void> => {
    return Promise.resolve()
  }),
}
