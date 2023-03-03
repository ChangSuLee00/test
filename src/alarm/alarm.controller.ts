import { Controller, Get, Post, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ReqWithUserId } from 'src/common/decorators/req_user_id.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { AlarmService } from './alarm.service';
import { CreateAlarmDto } from './dto/create-alarm.dto';
import { DeleteAlarmDto } from './dto/delete-alarm.dto';
import { AlarmEntity } from './entities/alarm.entity';

@Controller('api/alarm')
export class AlarmController {
  constructor(private readonly alarmService: AlarmService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  create_alarm(
    @ReqWithUserId() body: CreateAlarmDto,
  ): Promise<{ status: number; success: boolean }> {
    return this.alarmService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  findAll_alarm(@CurrentUser() user: UserEntity): Promise<AlarmEntity[]> {
    const id = user.id;
    return this.alarmService.findAll(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('notification')
  findAll_notification_alarm(
    @CurrentUser() user: UserEntity,
  ): Promise<AlarmEntity[]> {
    const id = user.id;
    return this.alarmService.findNotification(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('')
  remove_alarm(
    @ReqWithUserId() body: DeleteAlarmDto,
  ): Promise<{ status: number; success: boolean }> {
    return this.alarmService.remove(body);
  }
}
