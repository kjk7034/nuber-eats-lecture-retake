import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { CreateRestaurantInput } from './create-restaurant.dto';
import { IsString } from 'class-validator';

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field(() => String)
  @IsString()
  restaurantId: string;
}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}
