import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsString, Length } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Restaurant } from './restaurant.entity';

export type CategoryDocument = HydratedDocument<Category>;

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Schema()
export class Category extends CoreEntity {
  @Field(() => String)
  @Prop({ required: true, unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  @IsString()
  @IsOptional()
  coverImg?: string;

  @Field(() => String)
  @Prop({ required: true, unique: true })
  @IsString()
  slug: string;

  @Field(() => [Restaurant], { nullable: true })
  @IsOptional()
  restaurants?: Restaurant[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
