import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument, OrderStatus } from './entities/order.entity';
import { Model, Types } from 'mongoose';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orders: Model<Order>,
    @InjectModel(OrderItem.name) private readonly orderItems: Model<OrderItem>,
    @InjectModel(Restaurant.name)
    private readonly restaurants: Model<Restaurant>,
    @InjectModel(Dish.name)
    private readonly dishes: Model<Dish>,
  ) {}

  async crateOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findById(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const dish = await this.dishes.findById(item.dishId);
        if (!dish) {
          return {
            ok: false,
            error: 'Dish not found.',
          };
        }
        let dishFinalPrice = dish.price;
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice = dishFinalPrice + dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
                }
              }
            }
          }
        }
        orderFinalPrice = orderFinalPrice + dishFinalPrice;
        const orderItem = await this.orderItems.create({
          dish,
          options: item.options,
        });
        orderItems.push(orderItem);
      }
      const newOrder = await this.orders.create({
        customer,
        restaurant,
        total: orderFinalPrice,
        items: orderItems,
      });
      await this.restaurants.findByIdAndUpdate(
        restaurant.id,
        { $push: { orders: newOrder._id } },
        { new: true },
      );
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create order.',
      };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      const userId = new Types.ObjectId(user.id);
      if (user.role === UserRole.Client) {
        orders = await this.orders
          .find({
            customer: userId,
            ...(status && { status }),
          })
          .exec();
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders
          .find({
            driver: userId,
            ...(status && { status }),
          })
          .exec();
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants
          .find({
            owner: user.id,
          })
          .populate({
            path: 'orders',
            model: 'Order',
          })
          .exec();
        orders = restaurants
          .map((restaurant) => restaurant.orders as OrderDocument[])
          .flat();

        if (status) {
          orders = orders.filter((order) => order.status === status);
        }
      }
      return {
        ok: true,
        orders,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get orders',
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    const customerId =
      order.customer && new Types.ObjectId(order.customer.id).toString();
    const driverId =
      order.driver && new Types.ObjectId(order.driver.id).toString();

    let canSee = true;
    if (user.role === UserRole.Client && customerId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Delivery && driverId !== user.id) {
      canSee = false;
    }
    if (
      user.role === UserRole.Owner &&
      (order.restaurant as Restaurant).owner.id !== user.id
    ) {
      canSee = false;
    }
    return canSee;
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findById(orderId).populate({
        path: 'restaurant',
        populate: [
          {
            path: 'owner',
            model: 'User',
          },
        ],
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found.',
        };
      }
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: 'You cant see that',
        };
      }
      return {
        ok: true,
        order,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load order.',
      };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findById(orderId).populate({
        path: 'restaurant',
        populate: [
          {
            path: 'owner',
            model: 'User',
          },
        ],
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found.',
        };
      }
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: "Can't see this.",
        };
      }
      let canEdit = true;
      if (user.role === UserRole.Client) {
        canEdit = false;
      }
      if (user.role === UserRole.Owner) {
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
          canEdit = false;
        }
      }
      if (user.role === UserRole.Delivery) {
        if (
          status !== OrderStatus.PickedUp &&
          status !== OrderStatus.Delivered
        ) {
          canEdit = false;
        }
      }
      if (!canEdit) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }
      await this.orders.findByIdAndUpdate(orderId, { status }, { new: true });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit order.',
      };
    }
  }
}
