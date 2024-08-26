import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteDishInput {
  @Field(() => String)
  dishId: string;
}

@ObjectType()
export class DeleteDishOutput extends CoreOutput {}
