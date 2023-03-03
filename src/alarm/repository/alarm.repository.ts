import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAlarmDto } from '../dto/create-alarm.dto';
import { AlarmEntity } from '../entities/alarm.entity';

@Injectable()
export class AlarmRepository {
  constructor(
    @InjectRepository(AlarmEntity)
    private readonly alarmRepository: Repository<AlarmEntity>,
  ) {}

  async createAlarm(body: CreateAlarmDto) {
    const alarm = {
      ...body,
      user: { id: body.user_id },
    };
    try {
      const result = await this.alarmRepository.save(alarm);
    } catch (error) {
      throw new InternalServerErrorException('error while saving alarm');
      // 내부 서버 에러 500
    }
  }

  async findAllAlarmByUserId(id: number) {
    try {
      const result = await this.alarmRepository.find({
        where: { user: { id: id } },
        order: {
          time: 'ASC',
        },
      });
      return result;
    } catch (error) {
      throw new NotFoundException('error while finding alarm');
      // 페이지 또는 파일을 찾을 수 없음 404
    }
  }

  async findNotifyAlarm(id: number) {
    try {
      const query = `
        SELECT * FROM alarm
        WHERE user_id = ${id} AND time <= NOW()
      `;
      const result = await this.alarmRepository.query(query);
      return result;
    } catch (error) {
      throw new NotFoundException('error while finding alarm');
      // 페이지 또는 파일을 찾을 수 없음 404
    }
  }

  async deleteAlarm(body) {
    try {
      const result = await this.alarmRepository.delete({ id: body.id });
    } catch (error) {
      throw new InternalServerErrorException('error while saving alarm');
      // 내부 서버 에러 500
    }
  }
}
