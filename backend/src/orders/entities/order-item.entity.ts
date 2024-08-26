import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field(() => String)
  name: string;
  @Field(() => String, { nullable: true })
  choice?: string;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Schema() // Mongoose 스키마 정의
export class OrderItem extends CoreEntity {
  @Field(() => Dish)
  @Prop({ type: Types.ObjectId, ref: 'Dish', required: true })
  dish: Types.ObjectId | Dish;

  @Field(() => [OrderItemOption], { nullable: true })
  @Prop({ type: [{ type: Object }], required: false })
  options?: OrderItemOption[];
}

// Mongoose 모델 정의
export type OrderItemDocument = OrderItem & Document;
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
