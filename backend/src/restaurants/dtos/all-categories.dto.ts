import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Category } from '../entities/category.entity';
import { IsOptional } from 'class-validator';

@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
  @Field(() => [Category], { nullable: true })
  @IsOptional()
  categories?: Category[];
}
