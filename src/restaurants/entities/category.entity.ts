import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsString, Length } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Restaurant } from './restaurant.entity';

export type CategoryDocument = HydratedDocument<Category>;

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Schema({ _id: true })
export class Category extends CoreEntity {
  @Field(() => String)
  @Prop({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  @IsString()
  @IsOptional()
  coverImg?: string;

  @Field(() => String)
  @Prop({ unique: true })
  @IsString()
  slug: string;

  @Field(() => Restaurant)
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', unique: true })
  restaurant: Restaurant;

  @Field(() => [Restaurant])
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Restaurant' }] })
  restaurants: Types.ObjectId[] | Restaurant[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
