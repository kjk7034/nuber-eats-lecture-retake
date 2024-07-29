import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurants.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Restaurant, RestaurantSchema } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
  ],
  providers: [RestaurantResolver, RestaurantService],
})
export class RestaurantsModule {}
