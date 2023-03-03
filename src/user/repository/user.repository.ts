import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateKakaoUserDto } from 'src/auth/dto/create-kakao.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findUserByEmail(email: string): Promise<UserEntity> {
    try {
      const result = await this.userRepository.findOne({ where: { email } });
      return result;
    } catch (error) {
      throw new NotFoundException('error while finding user');
      // 페이지 또는 파일을 을 수 없음 404
    }
  }

  async createUserLocal(user: CreateUserDto): Promise<UserEntity> {
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('error while saving user');
      // 내부 서버 에러 500
    }
  }

  async findUserByIdWithoutPassword(
    userId: string,
  ): Promise<UserEntity | null> {
    const id = parseInt(userId, 10);
    try {
      const user = await this.userRepository.findOne({
        select: ['id', 'email', 'nick', 'provider'],
        where: { id },
      });
      return user;
    } catch (error) {
      throw new NotFoundException('error while finding user');
      // 페이지 또는 파일을 을 수 없음 404
    }
  }

  async findUserOauth(snsId: string, provider: any): Promise<UserEntity> {
    try {
      const result = await this.userRepository.findOne({
        where: { snsId, provider },
      });
      return result;
    } catch (error) {
      throw new NotFoundException('error while finding user');
      // 페이지 또는 파일을 을 수 없음 404
    }
  }

  async createUserOauth(user: CreateKakaoUserDto): Promise<UserEntity> {
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('error while saving user');
      // 내부 서버 에러 500
    }
  }

  async updateUser(user, body) {
    try {
      return await this.userRepository.update(user.id, body);
    } catch (error) {
      throw new InternalServerErrorException('error while updating user');
      // 내부 서버 에러 500
    }
  }

  async deleteUser(id: number) {
    try {
      return await this.userRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('error while deleting user');
      // 내부 서버 에러 500
    }
  }
}
