import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { comparePasswords } from './user.utils';

export class UsersService {
  constructor(@InjectModel(User.name) private users: Model<User>) {}

  async findAll() {
    return this.users.find().exec();
  }

  async create({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const isExist = await this.users.findOne({ email });
      if (isExist) {
        return {
          error: '이미 존재하는 email입니다.',
          ok: false,
        };
      }

      await this.users.create({ email, password, role });

      return {
        ok: true,
      };
    } catch (e) {
      console.log('e', e);
      return {
        error: '계정을 생성할 수 없습니다.',
        ok: false,
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({ email });

      const isPasswordValid = user
        ? await comparePasswords(password, user.password)
        : await comparePasswords(password, 'dummy_hash');

      if (!user || !isPasswordValid) {
        return {
          ok: false,
          error: 'Invalid email or password',
        };
      }

      // 로그인 성공 로직
      return {
        ok: true,
        token: 'lalalal',
      };
    } catch (error) {
      return {
        error,
        ok: false,
      };
    }
  }
}
