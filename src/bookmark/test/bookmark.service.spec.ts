import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkService } from '../bookmark.service';
import { BookmarkRepository } from '../repository/bookmark.repository';
import { CreateBookmarkDto } from '../dto/create-bookmark.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateBookmarkDto } from '../dto/update-bookmark.dto';

const mockBookmarkRepository = () => ({
  createBookmark: jest.fn((body) => {
    if (body.bookmarkName && body.URL && body.boxId) {
      return { bookmark: 1 };
    } else {
      throw new InternalServerErrorException();
    }
  }),

  findAllBookmarkById: jest.fn((boxId) => {
    if (boxId === 1) {
      return { bookmark: 1 };
    }
    return NotFoundException;
  }),

  updateBookmark: jest.fn((body) => {
    if (body.bookmarkName && body.URL && body.boxId && body.bookmarkId) {
      return { status: 200, success: true };
    } else {
      return { status: 422, success: false };
    }
  }),

  deleteBookmark: jest.fn((bookmarkId) => {
    if (bookmarkId) {
      return { status: 200, success: true };
    } else {
      return { status: 422, success: false };
    }
  }),
});

describe('BookmarkService', () => {
  let spyBookmarkService: BookmarkService;
  let spyBookmarkRepository: BookmarkRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarkService,
        {
          provide: BookmarkRepository,
          useFactory: mockBookmarkRepository,
        },
      ],
    }).compile();

    spyBookmarkService = module.get<BookmarkService>(BookmarkService);
    spyBookmarkRepository = module.get<BookmarkRepository>(BookmarkRepository);
  });

  describe('create_bookmark', () => {
    const body: CreateBookmarkDto = {
      bookmarkName: 'test_bookmarkName',
      URL: 'test_url',
      boxId: '1',
    };

    it('새 북마크 생성', async () => {
      const result = await spyBookmarkService.create(body);

      expect(spyBookmarkRepository.createBookmark).toBeCalled();
      expect(spyBookmarkRepository.createBookmark).toBeCalledWith({
        bookmarkName: body.bookmarkName,
        URL: body.URL,
        boxId: body.boxId,
      });
      expect(result).toEqual({ status: 201, success: true });
    });

    it('새 북마크 생성 실패', async () => {
      body.bookmarkName = null;
      try {
        const result = await spyBookmarkService.create(body);
      } catch (error) {
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('findAll_bookmark', () => {
    const boxId = 1;

    it('북마크 찾기 성공', async () => {
      const result = await spyBookmarkService.findAll(boxId);

      expect(spyBookmarkRepository.findAllBookmarkById).toBeCalled();
      expect(spyBookmarkRepository.findAllBookmarkById).toBeCalledWith(boxId);
      expect(result).toEqual({ bookmark: 1 });
    });

    it('북마크 찾기 실패', async () => {
      const user_id = 2;
      try {
        const result = await spyBookmarkService.findAll(boxId);
      } catch (error) {
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('update_bookmark', () => {
    const body: UpdateBookmarkDto = {
      bookmarkName: 'test_bookmarkname',
      URL: 'test_url',
      boxId: '1',
      bookmarkId: 1,
    };

    it('북마크 업데이트 성공', async () => {
      const result = await spyBookmarkService.update(body);

      expect(spyBookmarkRepository.updateBookmark).toBeCalledWith(body);
      expect(result).toEqual({ status: 200, success: true });
    });

    it('북마크 업데이트 실패', async () => {
      body.bookmarkName = null;
      try {
        const result = await spyBookmarkService.update(body);
      } catch (error) {
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf({ status: 422, success: false });
      }
    });
  });

  describe('delete_bookmark', () => {
    const bookmarkId = 1;

    it('북마크 삭제 성공', async () => {
      const result = await spyBookmarkService.remove(bookmarkId);

      expect(spyBookmarkRepository.deleteBookmark).toBeCalledWith(bookmarkId);
      expect(result).toEqual({ status: 200, success: true });
    });

    it('북마크 삭제 실패', async () => {
      const bookmarkId = null;
      try {
        const result = await spyBookmarkService.remove(bookmarkId);
      } catch (error) {
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf({ status: 422, success: false });
      }
    });
  });
});
