import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Payload } from '../payload/jwt.payload';
import { UserRepository } from 'src/user/repository/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 헤더의 토큰으로부터 추출.
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
      // jwt 만료 기간.
    });
  }

  async validate(payload: Payload) {
    // 디코딩된 payload가 적합한지 체크
    const user = await this.userRepository.findUserByIdWithoutPassword(
      payload.sub,
    );
    if (user) {
      return user;
      // request.user 안에 들어가게 된다.
    } else {
      throw new UnauthorizedException('접근 오류');
    }
  }
}
