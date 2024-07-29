import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CoreEntity } from 'src/common/entities/common.entity';
import { IsEmail, IsEnum } from 'class-validator';
import { hashPassword } from '../user.utils';
import { UpdateQuery } from 'mongoose';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User roles',
});

@InputType({ isAbstract: true })
@ObjectType()
@Schema({ timestamps: true, _id: true })
export class User extends CoreEntity {
  @Prop()
  @Field(() => String)
  @IsEmail()
  email: string;

  @Prop()
  @Field(() => String)
  password: string;

  @Prop({ type: String, enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;
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
