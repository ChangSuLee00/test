import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { GptService } from './gpt.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { CreateGpt_Q_Dto } from './dto/create-gpt-question.dto';
import { CreateGpt_A_Dto } from './dto/create-gpt-answer.dto';

@Controller('api/gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @UseGuards(JwtAuthGuard)
  @Post('question')
  question(@CurrentUser() user: UserEntity, @Body() gpt: CreateGpt_Q_Dto) {
    return this.gptService.question(user, gpt);
  }

  @UseGuards(JwtAuthGuard)
  @Post('answer')
  answer(@CurrentUser() user: UserEntity, @Body() gpt: CreateGpt_A_Dto) {
    return this.gptService.answer(user, gpt);
  }
}
