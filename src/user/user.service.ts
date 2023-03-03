import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './repository/user.repository';
import { UserEntity } from './entities/user.entity';
// commonjs는 default import가 없음

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  // 유저 생성
  async createUser(body: CreateUserDto) {
    const { email, nick, password } = body;
    const newUser = await this.userRepository.findUserByEmail(email);
    if (newUser) {
      throw new UnprocessableEntityException('이미 존재하는 사용자입니다.');
    }

    const hashPassword = await bcrypt.hash(password, 12);

    await this.userRepository.createUserLocal({
      email,
      nick,
      password: hashPassword,
    });
    return { status: 201, success: true };
  }

  async update(user: UserEntity, body: UpdateUserDto) {
    const { nick, password } = body;
    const userId = user.id.toString();

    const exUser = await this.userRepository.findUserByIdWithoutPassword(
      userId,
    );
    if (!exUser) {
      throw new InternalServerErrorException('error while finding user');
    }

    const hashPassword = await bcrypt.hash(password, 12);
    body.password = hashPassword;

    await this.userRepository.updateUser(user, body);
    return;
  }

  async remove(id: number) {
    const deleteUser = await this.userRepository.deleteUser(id);
    return { status: 200, success: true };
  }
}
