import { Injectable } from '@nestjs/common';
import { CreateAlarmDto } from './dto/create-alarm.dto';
import { DeleteAlarmDto } from './dto/delete-alarm.dto';
import { AlarmEntity } from './entities/alarm.entity';
import { AlarmRepository } from './repository/alarm.repository';

@Injectable()
export class AlarmService {
  constructor(private readonly alarmRepository: AlarmRepository) {}

  async create(
    body: CreateAlarmDto,
  ): Promise<{ status: number; success: boolean }> {
    const createdAlarm = await this.alarmRepository.createAlarm(body);
    return { status: 201, success: true };
  }

  async findAll(id: number): Promise<AlarmEntity[]> {
    const readAllAlarm = await this.alarmRepository.findAllAlarmByUserId(id);
    return readAllAlarm;
  }

  async findNotification(id: number): Promise<AlarmEntity[]> {
    const notificationAlarm = await this.alarmRepository.findNotifyAlarm(id);
    return notificationAlarm;
  }

  async remove(
    body: DeleteAlarmDto,
  ): Promise<{ status: number; success: boolean }> {
    const deleteAlarm = await this.alarmRepository.deleteAlarm(body);
    return { status: 200, success: true };
  }
}
