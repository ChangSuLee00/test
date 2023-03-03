import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new HttpException(
        'Token이 전송되지 않았습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    request.user = this.validateToken(authorization);
    return true;
  }

  validateToken(auth: string) {
    if (auth.split(' ')[0] !== 'Bearer') {
      throw new Error('토큰이 유효하지 않습니다 (Bearer)');
    }
    const token = auth.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      return decoded;
    } catch (err) {
      throw new HttpException(
        '토큰이 유효하지 않습니다 (Token)',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
