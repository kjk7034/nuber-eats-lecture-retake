import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Restaurant } from './restaurant.entity';

export type DishDocument = HydratedDocument<Dish>;

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Schema()
export class Dish extends CoreEntity {
  @Field(() => String)
  @Prop()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => Number)
  @Prop()
  @IsNumber()
  price: number;

  @Field(() => String)
  @Prop()
  @IsString()
  photo: string;

  @Field(() => String)
  @Prop()
  @IsString()
  @Length(5, 140)
  description: string;

  @Field(() => Restaurant, {})
  @Prop({
    type: Types.ObjectId,
    ref: 'Restaurant',
  })
  restaurant: Types.ObjectId | Restaurant;

  @Field(() => String)
  restaurantId: string;
}

export const DishSchema = SchemaFactory.createForClass(Dish);

// 가상 필드 설정
DishSchema.virtual('restaurantId').get(function () {
  return this.restaurant.toString();
});
