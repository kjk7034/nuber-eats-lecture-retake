import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { User } from './entities/user.entity';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { comparePasswords } from './user.utils';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';

export class UsersService {
  constructor(
    @InjectModel(User.name) private users: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

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

      const token = this.jwtService.sign(user.id);

      // 로그인 성공 로직
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        error,
        ok: false,
      };
    }
  }

  async findById(id: string): Promise<User> {
    return this.users.findById(id);
  }

  async editProfile(userId: string, editProfileInput: EditProfileInput) {
    return this.users.findByIdAndUpdate(
      userId,
      { $set: { ...editProfileInput } },
      { new: true, runValidators: true },
    );
  }
}
