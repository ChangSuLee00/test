import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkController } from '../bookmark.controller';
import { BookmarkService } from '../bookmark.service';
import { CreateBookmarkDto } from '../dto/create-bookmark.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateBookmarkDto } from '../dto/update-bookmark.dto';

const mockBookmarkService = () => ({
  create: jest.fn((createBookmarkDto) => {
    if (
      createBookmarkDto.bookmarkName &&
      createBookmarkDto.URL &&
      createBookmarkDto.boxId
    ) {
      return { status: 201, success: true };
    } else {
      return { status: 422, success: false };
    }
  }),

  findAll: jest.fn((boxId) => {
    if (boxId === 1) {
      return { box: 1 };
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
    if (body) {
      return { status: 201, success: true };
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
  let controller: BookmarkController;
  let spyBookmarkService: BookmarkService;
  let spyJwtAuthGuard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // Nest.js에서 제공하는 테스트 모듈을 만든다.
      controllers: [BookmarkController],
      providers: [
        // mocking function을 제공한다.
        { provide: BookmarkService, useFactory: mockBookmarkService },
        // privide = 프로바이더가 사용할 이름.
        // useFactory = 프로바이더가 동작할 방식을 결정한다 (동적 프로바이더 제공).
        // UserService의 함수는 팩토리 함수에서 반환된 값(함수)으로 제공된다.
        { provide: JwtAuthGuard, useFactory: MockJwtAuthGuard },
      ],
    }).compile();
    // 테스트 모듈에 등록된 provider와 기타 module의 인스턴스를 생성해서 종속성 해결.

    controller = module.get<BookmarkController>(BookmarkController);
    // UserController의 인스턴스를 가져온다. (get()은 TestingModule의 메서드)
    spyBookmarkService = module.get<BookmarkService>(BookmarkService);
    // UserService의 인스턴스를 가져온다.
    spyJwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  describe('create_bookmark', () => {
    it('북마크 생성 성공', async () => {
      const createBookmarkDto: CreateBookmarkDto = {
        bookmarkName: 'test_bookmarkname',
        URL: 'test_url',
        boxId: '1',
      };

      // Excute
      const response = await controller.create_bookmark(createBookmarkDto);

      // Expect
      expect(spyBookmarkService.create).toBeCalled();
      expect(spyBookmarkService.create).toBeCalledWith(createBookmarkDto);
      expect(response).toEqual({ status: 201, success: true });
    });

    it('북마크 생성 실패', async () => {
      const createBookmarkDto: any = {};

      // Excute
      const response = await controller.create_bookmark(createBookmarkDto);

      // Expect
      expect(spyBookmarkService.create).toBeCalled();
      expect(spyBookmarkService.create).toBeCalledWith(createBookmarkDto);
      expect(response).toEqual({ status: 422, success: false });
    });
  });

  describe('findAll_bookmark', () => {
    it('북마크 찾기 성공', async () => {
      const boxId = '1';

      // Excute
      const response = await controller.findAll_bookmark(boxId);

      // Expect
      expect(spyBookmarkService.findAll).toBeCalled();
      expect(spyBookmarkService.findAll).toBeCalledWith(+boxId);
      expect(response).toEqual({ box: 1 });
    });

    it('북마크 찾기 실패', async () => {
      const boxId = null;

      // Excute
      const response = await controller.findAll_bookmark(boxId);

      // Expect
      expect(spyBookmarkService.findAll).toBeCalled();
      expect(spyBookmarkService.findAll).toBeCalledWith(+boxId);
      expect(response).toEqual(NotFoundException);
    });
  });

  describe('update_bookmark', () => {
    it('북마크 업데이트 성공', async () => {
      const updateBookmarkDto: UpdateBookmarkDto = {
        bookmarkName: 'test_bookmarkname',
        URL: 'test_url',
        boxId: '1',
        bookmarkId: 1,
      };

      // Excute
      const response = await controller.update_bookmark(updateBookmarkDto);

      // Expect
      expect(spyBookmarkService.update).toBeCalled();
      expect(spyBookmarkService.update).toBeCalledWith(updateBookmarkDto);
      expect(response).toEqual({ status: 200, success: true });
    });

    it('북마크 업데이트 실패', async () => {
      const updateBookmarkDto: any = {};

      // Excute
      const response = await controller.update_bookmark(updateBookmarkDto);

      // // Expect
      expect(spyBookmarkService.update).toBeCalled();
      expect(spyBookmarkService.update).toBeCalledWith(updateBookmarkDto);
      expect(response).toEqual({ status: 422, success: false });
    });
  });

  describe('remove_bookmark', () => {
    it('북마크 삭제 성공', async () => {
      const body = {
        id: 1,
      };

      // Excute
      const response = await controller.remove_bookmark(body);

      // Expect
      expect(spyBookmarkService.remove).toBeCalled();
      expect(spyBookmarkService.remove).toBeCalledWith(body.id);
      expect(response).toEqual({ status: 201, success: true });
    });

    it('북마크 삭제 실패', async () => {
      const body = {
        id: null,
      };

      // Excute
      const response = await controller.remove_bookmark(body);

      // Expect
      expect(spyBookmarkService.remove).toBeCalled();
      expect(spyBookmarkService.remove).toBeCalledWith(body.id);
      expect(response).toEqual(InternalServerErrorException);
    });
  });
});
