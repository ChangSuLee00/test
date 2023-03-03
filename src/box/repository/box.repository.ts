import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBoxDto } from '../dto/create-box.dto';
import { BoxEntity } from '../entities/box.entity';
import * as fs from 'fs';
import { UpdateBoxDto } from '../dto/update-box.dto';

@Injectable()
export class BoxRepository {
  constructor(
    @InjectRepository(BoxEntity)
    private readonly boxRepository: Repository<BoxEntity>,
  ) {}

  async createBox(body: CreateBoxDto): Promise<BoxEntity> {
    try {
      const box = {
        ...body,
        user: { id: Number(body.user_id) },
        // box property 뿐 아니라 user property로 포함한다.
      };
      const result = await this.boxRepository.save(box);
      return;
    } catch (error) {
      throw new InternalServerErrorException('error while saving box');
      // 내부 서버 에러 500
    }
  }

  async findAllBoxByUserId(user_id: number): Promise<any> {
    try {
      const result = await this.boxRepository.find({
        where: {
          user: {
            id: user_id,
          },
        },
      });
      return result;
    } catch (error) {
      throw new NotFoundException('error while finding box');
      // 페이지 또는 파일을 찾을 수 없음 404
    }
  }

  async updateBox(body: UpdateBoxDto): Promise<any> {
    try {
      const { boxId, boxName, img } = body;
      const result = await this.boxRepository.update(boxId, { boxName, img });
      return result;
    } catch (error) {
      throw new NotFoundException('error while update box');
      // 페이지 또는 파일을 찾을 수 없음 404
    }
  }

  async deleteImg(body: any) {
    try {
      let url = body.deleteImg;
      url = url.replace('http://localhost:5000/img/', './uploads/');
      fs.unlinkSync(url);
    } catch (error) {
      throw new InternalServerErrorException('error while saving box');
      // 내부 서버 에러 500
    }
  }

  async deleteBox(body: { boxId: number; deleteImg: string }) {
    try {
      const result = await this.boxRepository.delete({ id: body.boxId });
      return result;
    } catch (error) {
      throw new InternalServerErrorException('error while saving box');
      // 내부 서버 에러 500
    }
  }
}
