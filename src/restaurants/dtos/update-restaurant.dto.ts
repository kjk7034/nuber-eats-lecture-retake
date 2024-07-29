import { CreateRestaurantDto } from './create-restaurant.dto';
import { ArgsType, PartialType } from '@nestjs/graphql';

@ArgsType()
export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {}
