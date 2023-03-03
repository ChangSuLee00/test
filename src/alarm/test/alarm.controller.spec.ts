import { Test, TestingModule } from '@nestjs/testing';
import { AlarmController } from '../alarm.controller';
import { AlarmService } from '../alarm.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from 'src/user/entities/user.entity';
import { DeleteAlarmDto } from '../dto/delete-alarm.dto';

const mockAlarmService = () => ({
  create: jest.fn((body) => {
    if (body.alarmName && body.time) {
      return { status: 201, success: true };
    } else {
      return { status: 422, success: false };
    }
  }),

  findAll: jest.fn((user_id) => {
    if (user_id) {
      return { alarm: 1 };
    } else {
      return NotFoundException;
    }
  }),

  update: jest.fn((updateBookmarkDto) => {
    if (updateBookmarkDto.bookmarkId) {
      return { status: 200, success: true };
    } else {
      return { status: 422, success: false };
    }
  }),

  remove: jest.fn((body) => {
    if (body.id) {
      return { status: 200, success: true };
    }
    return InternalServerErrorException;
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
  let controller: AlarmController;
  let spyAlarmService: AlarmService;
  let spyJwtAuthGuard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // Nest.js에서 제공하는 테스트 모듈을 만든다.
      controllers: [AlarmController],
      providers: [
        // mocking function을 제공한다.
        { provide: AlarmService, useFactory: mockAlarmService },
        // privide = 프로바이더가 사용할 이름.
        // useFactory = 프로바이더가 동작할 방식을 결정한다 (동적 프로바이더 제공).
        // UserService의 함수는 팩토리 함수에서 반환된 값(함수)으로 제공된다.
        { provide: JwtAuthGuard, useFactory: MockJwtAuthGuard },
      ],
    }).compile();
    // 테스트 모듈에 등록된 provider와 기타 module의 인스턴스를 생성해서 종속성 해결.

    controller = module.get<AlarmController>(AlarmController);
    // UserController의 인스턴스를 가져온다. (get()은 TestingModule의 메서드)
    spyAlarmService = module.get<AlarmService>(AlarmService);
    // UserService의 인스턴스를 가져온다.
    spyJwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  describe('create_alarm', () => {
    it('알람 생성 성공', async () => {
      const body: any = {
        alarmName: 'test_alarm',
        time: 'test_date',
      };
      const response = await controller.create_alarm(body);

      expect(spyAlarmService.create).toBeCalled();
      expect(spyAlarmService.create).toBeCalledWith(body);
      expect(response).toEqual({ status: 201, success: true });
    });

    it('알람 생성 실패', async () => {
      const body: any = {};
      const response = await controller.create_alarm(body);

      expect(spyAlarmService.create).toBeCalled();
      expect(spyAlarmService.create).toBeCalledWith(body);
      expect(response).toEqual({ status: 422, success: false });
    });
  });

  describe('findAll_alarm', () => {
    it('알람 찾기 성공', async () => {
      const user = new UserEntity();
      const response = await controller.findAll_alarm(user);

      expect(spyAlarmService.findAll).toBeCalled();
      expect(spyAlarmService.findAll).toBeCalledWith(user.id);
      expect(response).toBeTruthy();
    });

    it('알람 찾기 실패', async () => {
      const user = new UserEntity();
      user.id = null;
      const response = await controller.findAll_alarm(user);

      expect(spyAlarmService.findAll).toBeCalled();
      expect(spyAlarmService.findAll).toBeCalledWith(user.id);
      expect(response).toEqual(NotFoundException);
    });
  });

  describe('remove_alarm', () => {
    it('알람 삭제 성공', async () => {
      const body: DeleteAlarmDto = {
        id: 1,
        user_id: 1,
      };
      const response = await controller.remove_alarm(body);

      expect(spyAlarmService.remove).toBeCalled();
      expect(spyAlarmService.remove).toBeCalledWith(body);
      expect(response).toEqual({ status: 200, success: true });
    });

    it('알람 삭제 실패', async () => {
      const body: DeleteAlarmDto = {
        id: 1,
        user_id: 1,
      };
      body.id = null;
      const response = await controller.remove_alarm(body);

      expect(spyAlarmService.remove).toBeCalled();
      expect(spyAlarmService.remove).toBeCalledWith(body);
      expect(response).toEqual(InternalServerErrorException);
    });
  });
});
