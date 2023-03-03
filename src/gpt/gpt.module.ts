import { Module } from '@nestjs/common';
import { GptService } from './gpt.service';
import { GptController } from './gpt.controller';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GptEntity } from './entities/gpt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GptEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1y' },
    }),
  ],
  controllers: [GptController],
  providers: [GptService, JwtAuthGuard],
})
export class GptModule {}
