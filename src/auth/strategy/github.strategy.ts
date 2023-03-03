import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-github';
import { PassportStrategy } from '@nestjs/passport';
import { UserRepository } from 'src/user/repository/user.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
  ) {
    super({
      clientID: process.env.GITHUB_ID,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      clientSecret: process.env.GITHUB_SECRET,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, name, email } = profile._json;
    const nick = name;
    const snsId = id;
    const provider = 'github';

    try {
      const user = await this.userRepository.findUserOauth(snsId, provider);
      if (user === null) {
        const user = await this.userRepository.createUserOauth({
          email,
          nick,
          provider,
          snsId,
        });

        const payload = user;

        const access_token = this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: '7d',
        });

        done(null, { ...user, access_token });
      } else {
        const { id, email, nick, provider, snsId } = user;
        const payload = { id, email, nick, provider, snsId };

        const access_token = this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: '7d',
        });

        done(null, { ...user, access_token });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }
}
