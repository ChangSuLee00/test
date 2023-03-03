import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { AuthService } from '../../auth/auth.service';
import { LoginRequestDto } from '../../auth/dto/login.request.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { UserEntity } from '../entities/user.entity';

const mockUserService = () => ({
  createUser: jest.fn((createUserDto) => {
    if (createUserDto.email && createUserDto.nick && createUserDto.password) {
      return { status: 201, success: true };
    } else {
      return { status: 422, success: false };
    }
  }),
});

const mockAuthService = () => ({
  jwtLogIn: jest.fn((data) => {
    const token = 'test_token';
    const error = 'test_error';
    if (data.email && data.password) {
      return token;
    } else {
      return error;
    }
  }),
});

const MockJwtAuthGuard = (param) => {
  if (param === 'kakao' || param === 'github') {
    return {
      req: {
        user: {
          access_token: 'token',
          email: 'test_email',
        },
      },
    };
  }
  return { email: 'test_email', id: 'test_id' };
};

describe('UserController', () => {
  let controller: UserController;
  let spyUserService: UserService;
  let spyAuthService: AuthService;
  let spyJwtAuthGuard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // Nest.js에서 제공하는 테스트 모듈을 만든다.
      controllers: [UserController],
      providers: [
        // mocking function을 제공한다.
        { provide: UserService, useFactory: mockUserService },
        // privide = 프로바이더가 사용할 이름.
        // useFactory = 프로바이더가 동작할 방식을 결정한다 (동적 프로바이더 제공).
        // UserService의 함수는 팩토리 함수에서 반환된 값(함수)으로 제공된다.
        { provide: AuthService, useFactory: mockAuthService },
        { provide: JwtAuthGuard, useFactory: MockJwtAuthGuard },
      ],
    }).compile();
    // 테스트 모듈에 등록된 provider와 기타 module의 인스턴스를 생성해서 종속성 해결.

    controller = module.get<UserController>(UserController);
    // UserController의 인스턴스를 가져온다. (get()은 TestingModule의 메서드)
    spyUserService = module.get<UserService>(UserService);
    // UserService의 인스턴스를 가져온다.
    spyAuthService = module.get<AuthService>(AuthService);
    spyJwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  describe('registration', () => {
    it('유저 생성 컨트롤러 통과', async () => {
      const createUserDto: CreateUserDto = {
        email: 'testmail',
        nick: 'testnick',
        password: 'testpassword',
      };
      const response = await controller.createUser(createUserDto);

      expect(spyUserService.createUser).toBeCalled();
      expect(spyUserService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(response).toEqual({ status: 201, success: true });
    });

    it('유저 생성 컨트롤러 통과 실패', async () => {
      const createUserDto: any = {};
      const response = await controller.createUser(createUserDto);

      expect(spyUserService.createUser).toBeCalled();
      expect(spyUserService.createUser).toBeCalledWith(createUserDto);
      expect(response).toEqual({ status: 422, success: false });
    });
  });

  describe('login', () => {
    it('로그인 컨트롤러 통과', async () => {
      const data: LoginRequestDto = {
        email: 'test@email.com',
        password: 'test',
      };
      const response = await controller.login(data);

      expect(spyAuthService.jwtLogIn).toBeCalled();
      expect(spyAuthService.jwtLogIn).toBeCalledWith(data);
      expect(response).toEqual('test_token');
    });

    it('로그인 컨트롤러 통과 실패', async () => {
      const data: any = {
        email: 'test@email.com',
      };
      const response = await controller.login(data);

      expect(spyAuthService.jwtLogIn).toBeCalled();
      expect(spyAuthService.jwtLogIn).toBeCalledWith(data);
      expect(response).toEqual('test_error');
    });
  });

  describe('info', () => {
    it('정보 가져오기 성공', () => {
      const user = new UserEntity();
      const findOneSpy = jest.spyOn(controller, 'findOne');
      // authService나 userService에서 가져오는 것이 아니고
      // controller의 메서드를 spy한다.
      const response = controller.findOne(user);

      expect(findOneSpy).toBeCalledWith(user);
      expect(response).toBeTruthy();
    });
  });

  describe('kakao_login', () => {
    it('카카오 로그인 성공', async () => {
      const kakaoLoginSpy = jest.spyOn(controller, 'kakaoLogin');
      const response = await controller.kakaoLogin();

      expect(kakaoLoginSpy).toBeCalled();
      expect(response).toBe(200);
    });

    it('카카오 로그인 콜백 성공', async () => {
      const { req } = MockJwtAuthGuard('kakao');
      const res = {
        cookie: jest.fn(),
        redirect: jest.fn(),
        end: jest.fn(),
      };
      const kakaoLoginCallbackSpy = jest.spyOn(
        controller,
        'kakaoLoginCallback',
      );
      await controller.kakaoLoginCallback(req, res);

      expect(kakaoLoginCallbackSpy).toBeCalled();
      expect(res.cookie).toBeCalledWith('access_token', 'token');
      expect(res.redirect).toBeCalledWith('http://localhost:3000/redirect');
      expect(res.end).toBeCalled();
    });
  });

  describe('github_login', () => {
    it('깃허브 로그인 성공', async () => {
      const githubLoginSpy = jest.spyOn(controller, 'githubLogin');
      const response = await controller.githubLogin();

      expect(githubLoginSpy).toBeCalled();
      expect(response).toBe(200);
    });

    it('깃허브 로그인 콜백 성공', async () => {
      const { req } = MockJwtAuthGuard('github');
      const res = {
        cookie: jest.fn(),
        redirect: jest.fn(),
        end: jest.fn(),
      };
      const githubLoginCallbackSpy = jest.spyOn(
        controller,
        'githubLoginCallback',
      );
      await controller.githubLoginCallback(req, res);

      expect(githubLoginCallbackSpy).toBeCalled();
      expect(res.cookie).toBeCalledWith('access_token', 'token');
      expect(res.redirect).toBeCalledWith('http://localhost:3000/redirect');
      expect(res.end).toBeCalled();
    });
  });
});
