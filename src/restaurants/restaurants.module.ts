import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurants.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Restaurant, RestaurantSchema } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';
import { Category, CategorySchema } from './entities/category.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [RestaurantResolver, RestaurantService],
})
export class RestaurantsModule {}
