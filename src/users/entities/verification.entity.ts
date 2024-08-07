import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';

@InputType('VerificationInputType', { isAbstract: true })
@ObjectType()
@Schema({ timestamps: true, _id: true })
export class Verification extends CoreEntity {
  @Prop()
  @Field(() => String)
  code: string;

  @Prop({ type: Types.ObjectId, ref: 'User', unique: true })
  @Field(() => User)
  user: User;
}

export const VerificationSchema = SchemaFactory.createForClass(Verification);

// TypeORM BeforeInsert
VerificationSchema.pre('save', async function (next) {
  this.code = uuidv4();

  next();
});
