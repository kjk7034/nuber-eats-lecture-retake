import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { OrderResolver } from './orders.resolver';
import { OrderItem, OrderItemSchema } from './entities/order-item.entity';
import {
  Restaurant,
  RestaurantSchema,
} from 'src/restaurants/entities/restaurant.entity';
import { Dish, DishSchema } from 'src/restaurants/entities/dish.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([
      { name: OrderItem.name, schema: OrderItemSchema },
    ]),
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
    MongooseModule.forFeature([{ name: Dish.name, schema: DishSchema }]),
  ],
  providers: [OrderResolver, OrdersService],
  exports: [],
})
export class OrdersModule {}
