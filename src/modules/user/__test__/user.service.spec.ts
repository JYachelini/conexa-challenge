import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from '../user.service'
import { UserRepository } from '../user.repository'
import { UserExistsException } from '../exceptions/user.exceptions'
import { mockUserRepository } from './__mocks__/user.repository.mock'
import { mockCreateUser, mockUser } from './__mocks__/user.mock'

describe('UserService', () => {
  let userService: UserService
  let userRepository: jest.Mocked<UserRepository>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile()
    userService = module.get<UserService>(UserService)
    userRepository = module.get(UserRepository)
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const is_created = await userService.create(mockCreateUser)
      expect(is_created).toEqual(mockUser)
      expect(userRepository.createEntity).toHaveBeenCalledWith(mockCreateUser)
    })

    it('should handle repository errors during user creation', async () => {
      const error = new Error('Database connection failed')
      userRepository.createEntity.mockRejectedValue(error)

      await expect(userService.create(mockCreateUser)).rejects.toThrow('Database connection failed')
      expect(userRepository.createEntity).toHaveBeenCalledWith(mockCreateUser)
    })
  })

  describe('findByUsername', () => {
    it('should find user by username successfully', async () => {
      const username = mockUser.username
      const result = await userService.findByUsername(username)

      expect(result!.username).toEqual(mockUser.username)
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username },
        select: undefined,
      })
    })

    it('should find user by username with custom select options', async () => {
      const username = mockUser.username
      const selectOptions = { id: true, username: true }
      const result = await userService.findByUsername(username, selectOptions)

      expect(result!.username).toEqual(mockUser.username)
      expect(result!.role).toBeUndefined()
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username },
        select: selectOptions,
      })
    })

    it('should return null when user is not found', async () => {
      const username = 'nonexistent'
      const result = await userService.findByUsername(username)

      expect(result).toBeNull()
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username },
        select: undefined,
      })
    })
  })

  describe('checkIfUsernameExists', () => {
    it('should not throw error when username does not exist', async () => {
      const username = 'availableuser'
      userRepository.exists.mockResolvedValue(false)

      await expect(userService.checkIfUsernameExists(username)).resolves.toBeUndefined()
      expect(userRepository.exists).toHaveBeenCalledWith({ where: { username } })
    })

    it('should throw UserExistsException when username already exists', async () => {
      const username = mockUser.username
      userRepository.exists.mockResolvedValue(true)

      await expect(userService.checkIfUsernameExists(username)).rejects.toThrow(UserExistsException)
      expect(userRepository.exists).toHaveBeenCalledWith({ where: { username } })
    })

    it('should handle repository errors during username check', async () => {
      const username = 'testuser'
      const error = new Error('Database error')
      userRepository.exists.mockRejectedValue(error)

      await expect(userService.checkIfUsernameExists(username)).rejects.toThrow('Database error')
      expect(userRepository.exists).toHaveBeenCalledWith({ where: { username } })
    })
  })

  describe('updateRefreshToken', () => {
    it('should return true when update is successful', async () => {
      const userId = 1
      const refreshTokenHash = 'new_hashed_refresh_token'
      userRepository.update.mockResolvedValue({ affected: 1, raw: '', generatedMaps: [] })

      const is_updated = await userService.updateRefreshToken(userId, refreshTokenHash)
      expect(is_updated).toBe(true)
      expect(userRepository.update).toHaveBeenCalledWith({ id: userId }, { refresh_token_hash: refreshTokenHash })
    })

    it('should return false when user is not found', async () => {
      const userId = 999
      const refreshTokenHash = 'new_hashed_refresh_token'
      userRepository.update.mockResolvedValue({ affected: 0, raw: '', generatedMaps: [] })

      const is_updated = await userService.updateRefreshToken(userId, refreshTokenHash)
      expect(is_updated).toBe(false)
      expect(userRepository.update).toHaveBeenCalledWith({ id: userId }, { refresh_token_hash: refreshTokenHash })
    })

    it('should handle repository errors during refresh token update', async () => {
      const userId = 1
      const refreshTokenHash = 'new_hashed_refresh_token'
      const error = new Error('Update failed')
      userRepository.update.mockRejectedValue(error)

      await expect(userService.updateRefreshToken(userId, refreshTokenHash)).rejects.toThrow('Update failed')
      expect(userRepository.update).toHaveBeenCalledWith({ id: userId }, { refresh_token_hash: refreshTokenHash })
    })
  })

  describe('findById', () => {
    it('should find user by id successfully', async () => {
      const userId = mockUser.id
      const result = await userService.findById(userId)

      expect(result).toEqual(mockUser)
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: undefined,
      })
    })

    it('should find user by id with custom select options', async () => {
      const userId = mockUser.id
      const selectOptions = { id: true, username: true, role: true }

      const result = await userService.findById(userId, selectOptions)
      expect(result).toBeDefined()
      expect(result!.id).toEqual(mockUser.id)
      expect(result!.username).toEqual(mockUser.username)
      expect(result!.role).toEqual(mockUser.role)
      expect(result!.refresh_token_hash).toBeUndefined()
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: selectOptions,
      })
    })

    it('should return null when user is not found by id', async () => {
      const userId = 999
      const result = await userService.findById(userId)

      expect(result).toBeNull()
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: undefined,
      })
    })

    it('should handle repository errors during find by id', async () => {
      const userId = 1
      const error = new Error('Database connection failed')
      userRepository.findOne.mockRejectedValue(error)
      await expect(userService.findById(userId)).rejects.toThrow('Database connection failed')
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: undefined,
      })
    })
  })
})
