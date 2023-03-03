import { Test, TestingModule } from '@nestjs/testing';
import { BoxController } from '../box.controller';
import { BoxService } from '../box.service';
import { CreateBoxDto } from '../dto/create-box.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateBoxDto } from '../dto/update-box.dto';
import { UserEntity } from '../../user/entities/user.entity';
import { BoxEntity } from '../entities/box.entity';

jest.mock('../../user/entities/user.entity');

const mockBoxService = () => ({
  create: jest.fn((createBoxDto) => {
    if (createBoxDto.boxName && createBoxDto.img && createBoxDto.user_id) {
      return { status: 201, success: true };
    } else {
      return { status: 422, success: false };
    }
  }),

  findAll: jest.fn((user_id) => {
    if (user_id === 1) {
      return { box: 1 };
    } else {
      return NotFoundException;
    }
  }),

  update: jest.fn((updateBoxDto) => {
    if (
      updateBoxDto.boxName &&
      updateBoxDto.img &&
      updateBoxDto.user_id &&
      updateBoxDto.boxId &&
      updateBoxDto.deleteImg
    ) {
      return { status: 200, success: true };
    } else {
      return { status: 422, success: false };
    }
  }),

  remove: jest.fn((ReqWithUserId) => {
    if (ReqWithUserId.boxId) {
      return { box: 1 };
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
  let controller: BoxController;
  let spyBoxService: BoxService;
  let spyJwtAuthGuard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // Nest.js에서 제공하는 테스트 모듈을 만든다.
      controllers: [BoxController],
      providers: [
        // mocking function을 제공한다.
        { provide: BoxService, useFactory: mockBoxService },
        // privide = 프로바이더가 사용할 이름.
        // useFactory = 프로바이더가 동작할 방식을 결정한다 (동적 프로바이더 제공).
        // UserService의 함수는 팩토리 함수에서 반환된 값(함수)으로 제공된다.
        { provide: JwtAuthGuard, useFactory: MockJwtAuthGuard },
      ],
    }).compile();
    // 테스트 모듈에 등록된 provider와 기타 module의 인스턴스를 생성해서 종속성 해결.

    controller = module.get<BoxController>(BoxController);
    // UserController의 인스턴스를 가져온다. (get()은 TestingModule의 메서드)
    spyBoxService = module.get<BoxService>(BoxService);
    // UserService의 인스턴스를 가져온다.
    spyJwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  describe('UploadBox', () => {
    it('박스 생성 성공', async () => {
      const createBoxDto: CreateBoxDto = {
        boxName: 'test_boxname',
        img: 'test_img',
        user_id: 1,
      };

      // Excute
      const response = await controller.create_box(createBoxDto);

      // Expect
      expect(spyBoxService.create).toBeCalled();
      expect(spyBoxService.create).toBeCalledWith(createBoxDto);
      expect(response).toEqual({ status: 201, success: true });
    });

    it('박스 생성 실패', async () => {
      const createBoxDto: any = {};

      // Excute
      const response = await controller.create_box(createBoxDto);

      // Expect
      expect(spyBoxService.create).toBeCalled();
      expect(spyBoxService.create).toBeCalledWith(createBoxDto);
      expect(response).toEqual({ status: 422, success: false });
    });
  });

  describe('findAll', () => {
    const user = new UserEntity();
    it('박스 찾기 성공', async () => {
      // Excute
      const response = await controller.findAll_box(user);

      // Expect
      expect(spyBoxService.findAll).toBeCalled();
      expect(spyBoxService.findAll).toBeCalledWith(user.id);
      expect(response).toBeTruthy();
    });

    it('박스 찾기 실패', async () => {
      const user = new UserEntity();
      user.id = null;

      // Excute
      const response = await controller.findAll_box(user);

      // Expect
      expect(spyBoxService.findAll).toBeCalled();
      expect(spyBoxService.findAll).toBeCalledWith(user.id);
      expect(response).toEqual(NotFoundException);
    });
  });

  describe('update', () => {
    it('박스 업데이트 성공', async () => {
      const updateBoxDto: UpdateBoxDto = {
        boxName: 'test_boxname',
        img: 'test_img',
        user_id: 1,
        boxId: '1',
        deleteImg: 'test_delete',
      };

      // Excute
      const response = await controller.update_box(updateBoxDto);

      // Expect
      expect(spyBoxService.update).toBeCalled();
      expect(spyBoxService.update).toBeCalledWith(updateBoxDto);
      expect(response).toEqual({ status: 200, success: true });
    });

    it('박스 업데이트 실패', async () => {
      const updateBoxDto: any = {
        boxName: 'test_boxname',
        img: 'test_img',
        user_id: 1,
        boxId: '1',
      };

      // Excute
      const response = await controller.update_box(updateBoxDto);

      // Expect
      expect(spyBoxService.update).toBeCalled();
      expect(spyBoxService.update).toBeCalledWith(updateBoxDto);
      expect(response).toEqual({ status: 422, success: false });
    });
  });

  describe('remove', () => {
    it('박스 삭제 성공', async () => {
      const body: { boxId: number; deleteImg: string } = {
        boxId: 1,
        deleteImg: '',
      };

      // Excute
      const response = await controller.remove_box(body);

      // Expect
      expect(spyBoxService.remove).toBeCalled();
      expect(spyBoxService.remove).toBeCalledWith(body);
      expect(response).toEqual({ box: 1 });
    });

    it('박스 삭제 실패', async () => {
      const body: { boxId: number; deleteImg: string } = {
        boxId: 1,
        deleteImg: '',
      };
      body.boxId = null;

      // Excute
      const response = await controller.remove_box(body);

      // Expect
      expect(spyBoxService.remove).toBeCalled();
      expect(spyBoxService.remove).toBeCalledWith(body);
      expect(response).toEqual(InternalServerErrorException);
    });
  });
});
