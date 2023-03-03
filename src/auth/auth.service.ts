import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/user/repository/user.repository';
import { LoginRequestDto } from './dto/login.request.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async jwtLogIn(data: LoginRequestDto) {
    const { email, password } = data;

    // 해당 email 있는지 확인.
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('이메일과 비밀번호를 확인해주세요.');
    }

    // Password 검사.
    const isPasswordValidated: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (!isPasswordValidated) {
      throw new UnauthorizedException('이메일과 비밀번호를 확인해주세요.');
    }

    // jwt를 반환. // sub = 토큰 제목
    const payload = {
      email: email,
      id: user.id,
      nick: user.nick,
      provider: user.provider,
    };

    return {
      token: this.jwtService.sign(payload),
      // jwt 안에 있는 sign이란 함수에 payload를 넣어 토큰 발행.
    };
  }
}
