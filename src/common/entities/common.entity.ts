import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

@ObjectType()
@Schema({ timestamps: true, _id: true })
export class CoreEntity {
  @Field(() => ID)
  id: string;

  @Prop()
  @Field(() => Date)
  createdAt: Date;

  @Prop()
  @Field(() => Date)
  updatedAt: Date;
}
