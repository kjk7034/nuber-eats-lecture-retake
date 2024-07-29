import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RestaurantDocument = HydratedDocument<Restaurant>;

@ObjectType()
@Schema({ _id: true })
export class Restaurant {
  @Field(() => ID)
  id: string;

  @Prop()
  @Field(() => String)
  name: string;

  @Field(() => Boolean)
  @Prop()
  isVegan: boolean;

  @Field(() => String)
  @Prop()
  address: string;

  @Field(() => String)
  @Prop()
  ownerName: string;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
