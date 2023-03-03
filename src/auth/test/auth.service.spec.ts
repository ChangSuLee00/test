import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserRepository } from 'src/user/repository/user.repository';
import { LoginRequestDto } from '../dto/login.request.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcrypt');

const mockUserRepository = () => ({
  findUserByEmail: jest.fn((email) => {
    if (email === 'exist') {
      throw new UnprocessableEntityException('이미 존재하는 사용자입니다.');
    }
    const user = {
      email: 'test_email',
      password: 'test_password',
      nick: 'test_nick',
      provider: 'test_provider',
    };
    return user;
  }),
  createUserLocal: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => {
    const token = 'test_token';
    return token;
  }),
});

describe('UserService', () => {
  let spyAuthService: AuthService;
  let spyUserRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useFactory: mockJwtService,
        },
        {
          provide: UserRepository,
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    spyAuthService = module.get<AuthService>(AuthService);
    spyUserRepository = module.get<UserRepository>(UserRepository);
  });

  describe('createUser', () => {
    const mockLoginRequestDto: LoginRequestDto = {
      email: 'test@example.com',
      password: 'test_password',
    };
    (bcrypt.compare as jest.Mock).mockResolvedValue('test_password');

    it('jwtLogIn 성공', async () => {
      const result = await spyAuthService.jwtLogIn(mockLoginRequestDto);

      expect(spyUserRepository.findUserByEmail).toBeCalled();
      expect(bcrypt.compare).toBeCalledWith('test_password', 'test_password');
      expect(result).toEqual({ token: 'test_token' });
    });

    it('findUserByEmail 실패', async () => {
      mockLoginRequestDto.password = null;
      try {
        const result = await spyAuthService.jwtLogIn(mockLoginRequestDto);
      } catch (error) {
        expect(error).toBeTruthy();
        expect(error).toEqual(UnauthorizedException);
      }
    });

    it('bcrypt.compare 실패', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue('test_fail_password');
      try {
        const result = await spyAuthService.jwtLogIn(mockLoginRequestDto);
      } catch (error) {
        expect(error).toBeTruthy();
        expect(error).toEqual(UnauthorizedException);
      }
    });
  });
});
