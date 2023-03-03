import { Injectable } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { BookmarkRepository } from './repository/bookmark.repository';

@Injectable()
export class BookmarkService {
  constructor(private readonly bookmarkRepository: BookmarkRepository) {}

  async create(body: CreateBookmarkDto) {
    const createdBookmark = await this.bookmarkRepository.createBookmark(body);
    return { status: 201, success: true };
  }

  async findAll(boxId: number) {
    const readBookmarks = await this.bookmarkRepository.findAllBookmarkById(
      boxId,
    );
    return readBookmarks;
  }

  async update(body: UpdateBookmarkDto) {
    const updatedBookmark = await this.bookmarkRepository.updateBookmark(body);
    return { status: 200, success: true };
  }

  async remove(id: number) {
    const deletedBookmark = await this.bookmarkRepository.deleteBookmark(id);
    return { status: 200, success: true };
  }
}
