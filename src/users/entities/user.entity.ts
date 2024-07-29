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
