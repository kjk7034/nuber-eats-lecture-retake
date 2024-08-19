import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Restaurant } from './entities/restaurant.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { DeleteRestaurantOutput } from './dtos/delete-restaurant.dto';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category-dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name) private restaurants: Model<Restaurant>,
    @InjectModel(Category.name) private categories: Model<Category>,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const category = await this.getOrCreateCategory(
        createRestaurantInput.categoryName,
      );

      await this.restaurants.create({
        ...createRestaurantInput,
        owner: owner.id,
        category: category.id,
      });

      return {
        ok: true,
      };
    } catch (error) {
      console.error('레스토랑 생성 에러:', error);
      return {
        ok: false,
        error: '레스토랑을 생성할 수 없습니다.',
      };
    }
  }

  async getOrCreateCategory(name: string): Promise<Category> {
    try {
      const categoryName = name.trim().toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-');

      let category = await this.categories.findOne({ slug: categorySlug });
      if (!category) {
        category = await this.categories.create({
          name: categoryName,
          slug: categorySlug,
        });
      }
      return category;
    } catch (error) {
      console.log('error', error);
      throw new Error(`카테고리 생성 중 오류 발생: ${error.message}`);
    }
  }

  async editRestaurant(
    owner: User,
    { restaurantId, categoryName, ...editRestaurantInput }: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findById(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.owner.toString()) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        };
      }
      let category: Category = null;
      if (categoryName) {
        category = await this.getOrCreateCategory(categoryName);
      }
      await this.restaurants.findByIdAndUpdate(
        restaurantId,
        {
          $set: {
            ...editRestaurantInput,
            ...(category && { category: category.id }),
          },
        },
        { new: true, runValidators: true },
      );
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not edit Restaurant',
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId },
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants
        .findById(restaurantId)
        .populate('owner')
        .exec();
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.owner.id) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own",
        };
      }
      console.log('will delete restaurant');
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not delete restaurant',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }

  async countRestaurants(category: Types.ObjectId | string): Promise<number> {
    return this.restaurants.countDocuments({ category });
  }

  async findCategoryBySlug({
    slug,
    // page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found.',
        };
      }

      /**
       *  @ResolveField('restaurants' 대신 사용 가능
       */
      // const restaurants: Restaurant[] = await this.restaurants
      //   .find({ category: category.id })
      //   .limit(25)
      //   .skip((page - 1) * 25)
      //   .exec();

      // category.restaurants = restaurants;

      const totalResults = await this.countRestaurants(category.id);

      return {
        ok: true,
        category,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }

  async findRestaurantsByCategory(categoryId: string): Promise<Restaurant[]> {
    return this.restaurants.find({ category: categoryId }).exec();
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await Promise.all([
        this.restaurants
          .find()
          .skip((page - 1) * 25)
          .limit(25)
          .exec(),
        this.restaurants.countDocuments(),
      ]);
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load restauranst',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findById(restaurantId);

      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      /**
       * $regex: MongoDB의 정규표현식 연산자로, SQL의 LIKE와 유사한 기능을 제공합니다.
       * $options: 'i': 대소문자를 구분하지 않도록 설정합니다.
       */
      const filter = { name: { $regex: query, $options: 'i' } };

      const [restaurants, totalResults] = await Promise.all([
        this.restaurants
          .find(filter)
          .skip((page - 1) * 25)
          .limit(25)
          .exec(),
        this.restaurants.countDocuments(filter),
      ]);

      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not saerch for restaurants',
      };
    }
  }
}
