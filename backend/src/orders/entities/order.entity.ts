import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { IsEnum, IsNumber } from 'class-validator';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}
registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Schema()
export class Order extends CoreEntity {
  @Field(() => User, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  customer?: Types.ObjectId | User;

  @Prop({ type: String })
  customerId: string;

  @Field(() => User, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  driver?: Types.ObjectId | User;

  @Prop({ type: String })
  driverId: string;

  @Field(() => Restaurant, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: false })
  restaurant?: Types.ObjectId | Restaurant;

  @Field(() => [OrderItem])
  @Prop({ type: [{ type: Types.ObjectId, ref: 'OrderItem' }] })
  items: Types.ObjectId[] | OrderItem[];

  @Field(() => Number, { nullable: true })
  @Prop({ required: false })
  @IsNumber()
  total?: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.Pending })
  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.pre('save', function (next) {
  if (this.isModified('customer')) {
    this.customerId = this.customer.id.toString();
  }
  if (this.isModified('driver')) {
    this.driverId = this.driver.id.toString();
  }
  next();
});
