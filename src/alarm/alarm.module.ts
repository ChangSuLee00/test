import { Module } from '@nestjs/common';
import { AlarmService } from './alarm.service';
import { AlarmController } from './alarm.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmEntity } from './entities/alarm.entity';
import { AlarmRepository } from './repository/alarm.repository';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([AlarmEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1y' },
    }),
  ],
  controllers: [AlarmController],
  providers: [AlarmService, AlarmRepository, JwtAuthGuard],
})
export class AlarmModule {}
