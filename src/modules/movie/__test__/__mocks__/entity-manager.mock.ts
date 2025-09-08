import { mockMovieEntity } from './movie.mock'

export const mockEntityManager = {
  transaction: jest.fn().mockImplementation(async (callback: any) => {
    return await callback(mockEntityManager)
  }),
  findOne: jest.fn().mockImplementation(() => Promise.resolve(null)),
  create: jest.fn().mockImplementation((entityClass: any, data: any) => ({ ...data, id: 1 })),
  save: jest.fn().mockImplementation((entityClass: any, data: any) => Promise.resolve({ ...data, id: data.id || 1 })),
  update: jest.fn().mockImplementation(() => Promise.resolve({ affected: 1 })),
  delete: jest.fn().mockImplementation(() => Promise.resolve({ affected: 1 })),
}

export const mockEntityManagerWithMovie = {
  ...mockEntityManager,
  findOne: jest.fn().mockImplementation(() => Promise.resolve(mockMovieEntity)),
}
