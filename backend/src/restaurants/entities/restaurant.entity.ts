import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString, Length } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Category } from './category.entity';
import { User } from 'src/users/entities/user.entity';
import { Dish } from './dish.entity';
import { Order } from 'src/orders/entities/order.entity';

export type RestaurantDocument = HydratedDocument<Restaurant>;

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Schema()
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
  category: Types.ObjectId | Category;

  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: 'User' })
  owner: Types.ObjectId | User;

  @Field(() => String)
  ownerId: string;

  @Field(() => [Order])
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Order' }] })
  orders: Types.ObjectId[] | Order[];

  @Field(() => [Dish])
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Dish' }] })
  menu: Types.ObjectId[] | Dish[];
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
