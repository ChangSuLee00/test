import { Injectable } from '@nestjs/common';
import { CreateBoxDto } from './dto/create-box.dto';
import { UpdateBoxDto } from './dto/update-box.dto';
import { BoxRepository } from './repository/box.repository';

@Injectable()
export class BoxService {
  constructor(private readonly boxRepository: BoxRepository) {}

  async create(body: CreateBoxDto) {
    const createdBox = await this.boxRepository.createBox(body);
    return { status: 201, success: true };
  }

  async findAll(user_id: number) {
    const readBoxs = await this.boxRepository.findAllBoxByUserId(user_id);
    return readBoxs;
  }

  async update(body: UpdateBoxDto) {
    const updatedBox = await this.boxRepository.updateBox(body);
    if (updatedBox) {
      const deletedImg = await this.boxRepository.deleteImg(body);
      return { status: 200, success: true };
    }
    return { status: 422, success: false };
    // 요청 문법은 맞지만 지시에 따를 수 없음
  }

  async remove(body: { boxId: number; deleteImg: string }) {
    const deletedBox = await this.boxRepository.deleteBox(body);
    if (deletedBox) {
      const deletedImg = await this.boxRepository.deleteImg(body);
      return { status: 200, success: true };
    }
    return { status: 422, success: false };
    // 요청 문법은 맞지만 지시에 따를 수 없음
  }
}
