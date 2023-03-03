import { Test, TestingModule } from '@nestjs/testing';
import { AlarmService } from '../alarm.service';
import { AlarmRepository } from '../repository/alarm.repository';
import { CreateAlarmDto } from '../dto/create-alarm.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DeleteAlarmDto } from '../dto/delete-alarm.dto';

const mockAlarmRepository = () => ({
  createAlarm: jest.fn((body) => {
    if (body.alarmName && body.time) {
      return { alarm: 1 };
    } else {
      throw new InternalServerErrorException();
    }
  }),

  findAllAlarmByUserId: jest.fn((user_id) => {
    if (user_id === 1) {
      return { alarm: 1 };
    }
    return NotFoundException;
  }),

  deleteAlarm: jest.fn((body) => {
    if (body.id) {
      return { status: 200, success: true };
    } else {
      return { status: 422, success: false };
    }
  }),

  findNotifyAlarm: jest.fn(),
});

describe('AlarmService', () => {
  let spyAlarmService: AlarmService;
  let spyAlarmRepository: AlarmRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlarmService,
        {
          provide: AlarmRepository,
          useFactory: mockAlarmRepository,
        },
      ],
    }).compile();

    spyAlarmService = module.get<AlarmService>(AlarmService);
    spyAlarmRepository = module.get<AlarmRepository>(AlarmRepository);
  });

  describe('create_alarm', () => {
    const body: CreateAlarmDto = {
      alarmName: 'test_alarm',
      time: new Date(),
      user_id: 1,
    };

    it('새 알람 생성', async () => {
      const result = await spyAlarmService.create(body);

      expect(spyAlarmRepository.createAlarm).toBeCalled();
      expect(spyAlarmRepository.createAlarm).toBeCalledWith(body);
      expect(result).toEqual({ status: 201, success: true });
    });

    it('새 알람 생성 실패', async () => {
      body.alarmName = null;
      try {
        const result = await spyAlarmService.create(body);
      } catch (error) {
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('findAll_alarm', () => {
    const user_id = 1;

    it('알람 찾기 성공', async () => {
      const result = await spyAlarmService.findAll(user_id);

      expect(spyAlarmRepository.findAllAlarmByUserId).toBeCalled();
      expect(spyAlarmRepository.findAllAlarmByUserId).toBeCalledWith(user_id);
      expect(result).toEqual({ alarm: 1 });
    });

    it('알람 찾기 실패', async () => {
      const user_id = 2;
      try {
        const result = await spyAlarmService.findAll(user_id);
      } catch (error) {
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('findAll_notification_alarm', () => {
    const user_id = 1;

    it('notify 알람 찾기 성공', async () => {
      (spyAlarmRepository.findNotifyAlarm as jest.Mock).mockReturnValue({
        alarm: 1,
      });
      const result = await spyAlarmService.findNotification(user_id);

      expect(spyAlarmRepository.findNotifyAlarm).toBeCalled();
      expect(spyAlarmRepository.findNotifyAlarm).toBeCalledWith(user_id);
      expect(result).toEqual({ alarm: 1 });
    });

    it('notify 알람 찾기 실패', async () => {
      (spyAlarmRepository.findNotifyAlarm as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );
      try {
        const result = await spyAlarmService.findAll(user_id);
      } catch (error) {
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('delete_alarm', () => {
    const body: DeleteAlarmDto = { id: 1, user_id: 1 };

    it('알람 삭제 성공', async () => {
      const result = await spyAlarmService.remove(body);

      expect(spyAlarmRepository.deleteAlarm).toBeCalledWith(body);
      expect(result).toEqual({ status: 200, success: true });
    });

    it('알람 삭제 실패', async () => {
      const body: DeleteAlarmDto = { id: 1, user_id: 1 };
      body.id = null;
      try {
        const result = await spyAlarmService.remove(body);
      } catch (error) {
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf({ status: 422, success: false });
      }
    });
  });
});
