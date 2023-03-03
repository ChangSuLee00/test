import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../repository/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UnprocessableEntityException } from '@nestjs/common';

jest.mock('bcrypt');

const mockUserRepository = () => ({
  findUserByEmail: jest.fn(),
  createUserLocal: jest.fn(),
});

describe('UserService', () => {
  let spyUserService: UserService;
  let spyUserRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    spyUserService = module.get<UserService>(UserService);
    spyUserRepository = module.get<UserRepository>(UserRepository);
  });

  describe('createUser', () => {
    const mockCreateUserDto: CreateUserDto = {
      email: 'test@example.com',
      nick: 'test_nick',
      password: 'test_password',
    };
    (bcrypt.hash as jest.Mock).mockResolvedValue('test_hash');

    it('새 유저 생성 성공', async () => {
      // Method Mocking
      (spyUserRepository.findUserByEmail as jest.Mock).mockReturnValue(null);
      (spyUserRepository.createUserLocal as jest.Mock).mockReturnValue(true);

      // Excute
      const result = await spyUserService.createUser(mockCreateUserDto);

      // Expect
      expect(spyUserRepository.findUserByEmail).toBeCalledWith(
        mockCreateUserDto.email,
      );
      expect(bcrypt.hash).toBeCalledWith(mockCreateUserDto.password, 12);
      expect(spyUserRepository.createUserLocal).toBeCalledWith({
        email: mockCreateUserDto.email,
        nick: mockCreateUserDto.nick,
        password: 'test_hash',
      });
      expect(result).toEqual({ status: 201, success: true });
    });

    it('새 유저 생성 실패(이미 존재하는 사용자입니다)', async () => {
      // Method Mocking
      (spyUserRepository.findUserByEmail as jest.Mock).mockReturnValue('user');
      (spyUserRepository.createUserLocal as jest.Mock).mockReturnValue(true);

      try {
        // Excute
        const result = await spyUserService.createUser(mockCreateUserDto);
      } catch (error) {
        // Expect
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(UnprocessableEntityException);
      }
    });

    it('새 유저 생성 실패(createUserLocal 실패)', async () => {
      // Method Mocking
      (spyUserRepository.findUserByEmail as jest.Mock).mockReturnValue('user');
      (spyUserRepository.createUserLocal as jest.Mock).mockRejectedValue(
        new UnprocessableEntityException(),
      );

      try {
        // Excute
        const result = await spyUserService.createUser(mockCreateUserDto);
      } catch (error) {
        // Expect
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(UnprocessableEntityException);
      }
    });
  });
});
