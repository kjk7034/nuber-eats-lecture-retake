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
import {
  EditProfileDtoOutput,
  EditProfileInput,
} from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { MailService } from 'src/mail/mail.service';

export class UserService {
  constructor(
    @InjectModel(User.name) private users: Model<User>,
    @InjectModel(Verification.name) private verifications: Model<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
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

      const user = await this.users.create({ email, password, role });
      const verification = await this.verifications.create({
        user,
      });
      this.mailService.sendVerificationEmail(user.email, verification.code);
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
      const user = await this.users.findOne({ email }).select('+password');

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

  async findById(id: string): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findById(id);
      if (!user) {
        throw Error();
      }
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        error: 'User Not Found',
        ok: false,
      };
    }
  }

  async editProfile(
    userId: string,
    editProfileInput: EditProfileInput,
  ): Promise<EditProfileDtoOutput> {
    try {
      if (editProfileInput.email) {
        editProfileInput.verified = false;

        // 기존 verification 삭제
        await this.verifications.deleteMany({ user: userId });

        // 새 verification 생성
        const verification = await this.verifications.create({ user: userId });
        this.mailService.sendVerificationEmail(
          editProfileInput.email,
          verification.code,
        );
      }

      await this.users.findByIdAndUpdate(
        userId,
        { $set: { ...editProfileInput } },
        { new: true, runValidators: true },
      );

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications
        .findOne({ code })
        .populate('user')
        .exec();
      if (verification) {
        await this.users.findByIdAndUpdate(
          verification.user.id,
          { $set: { verified: true } },
          { new: true, runValidators: true },
        );
        await this.verifications.deleteOne(verification.id);
        return {
          ok: true,
        };
      }
      throw new Error();
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
