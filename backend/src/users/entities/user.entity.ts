import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CoreEntity } from 'src/common/entities/common.entity';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { hashPassword } from '../user.utils';
import { Model, Query, Types, UpdateQuery } from 'mongoose';
import { Verification } from './verification.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User roles',
});

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Schema({ timestamps: true, _id: true })
export class User extends CoreEntity {
  @Field(() => String)
  @Prop({ unique: true })
  @IsEmail()
  email: string;

  @Field(() => String)
  @Prop({ select: false })
  @IsString()
  password: string;

  @Field(() => UserRole)
  @Prop({ type: String, enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @Field(() => Boolean)
  @Prop({ default: false })
  @IsBoolean()
  verified: boolean;

  @Field(() => [Restaurant])
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Restaurant' }] })
  restaurants: Types.ObjectId[] | Restaurant[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// TypeORM BeforeInsert
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await hashPassword(this.password);
    return next();
  } catch (e) {
    return next(e);
  }
});

// TypeORM BeforeUpdate
UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as UpdateQuery<User>;
  if (update.$set && update.$set.password) {
    try {
      update.$set.password = await hashPassword(update.$set.password);
    } catch (error) {
      return next(error);
    }
  }
  return next();
});

// TypeORM onDelete: 'CASCADE' 구현
UserSchema.pre<Query<any, User>>('findOneAndDelete', async function (next) {
  try {
    const user = (await this.model.findOne(this.getFilter())) as User | null;
    if (user) {
      const VerificationModel: Model<Verification> = new this.model(
        'Verification',
      );
      await VerificationModel.deleteOne({ user: user.id });
    }
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error('Unknown error'));
  }
});
