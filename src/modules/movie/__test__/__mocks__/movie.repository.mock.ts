import { mockEntityManager } from './entity-manager.mock'

export const mockMovieRepository = {
  manager: mockEntityManager,
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  exists: jest.fn(),
}
