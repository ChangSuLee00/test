import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { boolean } from 'joi';
import { Like, Repository } from 'typeorm';
import { CreateFeedDto } from '../dto/create-feed.dto';
import { FeedEntity } from '../entities/feed.entity';

@Injectable()
export class FeedRepository {
  constructor(
    @InjectRepository(FeedEntity)
    private readonly feedRepository: Repository<FeedEntity>,
  ) {}

  async createFeed(feed: CreateFeedDto) {
    try {
      const image = feed.img
        ? feed.img.url
        : 'https://raw.githubusercontent.com/ChangSuLee00/CS-study/main/pictures/default.png';
      const feed_order = {
        ...feed,
        user: { id: parseInt(feed.user_id) },
        img: image,
        // box property 뿐 아니라 user property로 포함한다.
      };
      const result = await this.feedRepository.save(feed_order);
    } catch (error) {
      throw new InternalServerErrorException('error while saving Feed');
      // 내부 서버 에러 500}
    }
  }

  async pagenateFeed(query: { id: number; search: string | boolean }) {
    const page = 4;
    if (
      query.search == 'null' ||
      query.search == 'undefined' ||
      query.search == 'false'
    ) {
      query.search = false;
    }
    try {
      if (query.search) {
        const result = await this.feedRepository.find({
          select: ['FeedName', 'FeedContent', 'URL', 'img', 'id'],
          where: [
            { FeedContent: Like(`%${query.search}%`) },
            { FeedName: Like(`%${query.search}%`) },
          ],
          take: 4,
          skip: page * query.id,
          order: { id: 'DESC' },
          relations: ['user'],
        });
        return result;
      } else {
        const result = await this.feedRepository.find({
          take: 4,
          skip: page * query.id,
          order: { id: 'DESC' },
          relations: ['user'],
        });
        return result;
      }
    } catch (error) {
      throw new NotFoundException('error while find paging Feed');
    }
  }

  async deleteFeed(id: number) {
    try {
      const result = await this.feedRepository.delete({ id });
    } catch (error) {
      throw new InternalServerErrorException('error while deleting Feed');
    }
  }
}
