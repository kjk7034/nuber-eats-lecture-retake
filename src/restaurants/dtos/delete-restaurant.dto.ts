import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteRestaurantInput {
  @Field(() => String)
  restaurantId: string;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
