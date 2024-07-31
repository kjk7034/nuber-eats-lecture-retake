import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { UserResolver } from './users.resolver';
import { UserService } from './users.service';
import {
  Verification,
  VerificationSchema,
} from './entities/verification.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Verification.name, schema: VerificationSchema },
    ]),
  ],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UsersModule {}
