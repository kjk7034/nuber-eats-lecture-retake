import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { RestaurantService } from './restaurant.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Query(() => [Restaurant])
  async restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.findAll();
  }

  @Mutation(() => Restaurant)
  async createRestaurant(
    @Args() createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    return this.restaurantService.create(createRestaurantDto);
  }
}
