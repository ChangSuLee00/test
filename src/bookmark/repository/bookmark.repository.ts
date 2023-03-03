import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookmarkDto } from '../dto/create-bookmark.dto';
import { UpdateBookmarkDto } from '../dto/update-bookmark.dto';
import { BookmarkEntity } from '../entities/bookmark.entity';

@Injectable()
export class BookmarkRepository {
  constructor(
    @InjectRepository(BookmarkEntity)
    private readonly bookmarkRepository: Repository<BookmarkEntity>,
  ) {}

  async createBookmark(body: CreateBookmarkDto) {
    try {
      const bookmark = {
        ...body,
        box: { id: Number(body.boxId) },
        // bookmark property 뿐 아니라 box property로 포함한다.
      };
      const result = await this.bookmarkRepository.save(bookmark);
    } catch (error) {
      throw new InternalServerErrorException('error while saving bookmark');
      // 내부 서버 에러 500
    }
  }

  async findAllBookmarkById(boxId: number) {
    try {
      const result = await this.bookmarkRepository.find({
        where: {
          box: {
            id: boxId,
          },
        },
      });
      return result;
    } catch (error) {
      throw new NotFoundException('error while finding bookmark');
      // 페이지 또는 파일을 찾을 수 없음 404
    }
  }

  async updateBookmark(body: UpdateBookmarkDto) {
    try {
      const result = await this.bookmarkRepository.update(body.bookmarkId, {
        bookmarkName: body.bookmarkName,
        URL: body.URL,
      });
    } catch (error) {
      throw new InternalServerErrorException('error while updating bookmark');
      // 내부 서버 에러 500
    }
  }

  async deleteBookmark(id: number) {
    try {
      const result = await this.bookmarkRepository.delete({ id: id });
    } catch (error) {
      throw new InternalServerErrorException('error while saving bookmark');
      // 내부 서버 에러 500
    }
  }
}
