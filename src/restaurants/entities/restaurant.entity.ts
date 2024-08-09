import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsString, Length } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Category } from './category.entity';
import { User } from 'src/users/entities/user.entity';

export type RestaurantDocument = HydratedDocument<Restaurant>;

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Schema({ _id: true })
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Prop()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String)
  @Prop()
  @IsString()
  coverImg: string;

  @Field(() => String, { defaultValue: '강남' })
  @Prop()
  @IsString()
  address: string;

  @Field(() => Category, { nullable: true })
  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: false,
  })
  @IsOptional()
  category?: Types.ObjectId | Category;

  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: 'User' })
  owner: Types.ObjectId | User;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
