import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  Req,
  Res,
  Patch,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { LoginRequestDto } from 'src/auth/dto/login.request.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('registration')
  async createUser(@Body() body: CreateUserDto) {
    const response = await this.userService.createUser(body);
    return response;
  }

  @Post('login')
  login(@Body() data: LoginRequestDto) {
    return this.authService.jwtLogIn(data);
  }

  @UseGuards(JwtAuthGuard)
  // Guards에서 인증처리된 것을 req에 넘겨준다.
  @Get('info')
  findOne(@CurrentUser() user: UserEntity) {
    // 커스텀 데코레이터
    return user;
    // user를 readonly로 넘겨준다.
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/')
  patchUser(@CurrentUser() user: UserEntity, @Body() body: UpdateUserDto) {
    return this.userService.update(user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/')
  deleteUser(@CurrentUser() user: UserEntity) {
    return this.userService.remove(user.id);
  }

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin() {
    return HttpStatus.OK;
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLoginCallback(@Req() req, @Res() res): Promise<any> {
    const access_token = req.user.access_token;
    res
      .cookie('access_token', access_token)
      .redirect(`${process.env.REDIRECT_FRONT}`)
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {
    return HttpStatus.OK;
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubLoginCallback(@Req() req, @Res() res): Promise<any> {
    const access_token = req.user.access_token;
    res
      .cookie('access_token', access_token)
      .redirect(`${process.env.REDIRECT_FRONT}`)
  }
}
