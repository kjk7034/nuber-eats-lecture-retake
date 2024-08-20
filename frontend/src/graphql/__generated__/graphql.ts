/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** `Date` type as integer. Type represents date and time as number of milliseconds from start of UNIX epoch. */
  Timestamp: { input: any; output: any; }
};

export type AllCategoriesOutput = {
  categories?: Maybe<Array<Category>>;
  error?: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
};

export type Category = {
  coverImg?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  restaurantCount: Scalars['Float']['output'];
  restaurants: Array<Restaurant>;
  slug: Scalars['String']['output'];
  updatedAt: Scalars['Timestamp']['output'];
};

export type CategoryInput = {
  page?: Scalars['Float']['input'];
  slug: Scalars['String']['input'];
};

export type CategoryOutput = {
  category?: Maybe<Category>;
  error?: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
  totalPages?: Maybe<Scalars['Float']['output']>;
  totalResults?: Maybe<Scalars['Float']['output']>;
};

export type CreateAccountInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role: UserRole;
};

export type CreateAccountOutput = {
  error?: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
};

export type CreateRestaurantInput = {
  address?: Scalars['String']['input'];
  categoryName: Scalars['String']['input'];
  coverImg: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateRestaurantOutput = {
  error?: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
};

export type DeleteRestaurantInput = {
  restaurantId: Scalars['String']['input'];
};

export type DeleteRestaurantOutput = {
  error?: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
};

export type Dish = {
  createdAt: Scalars['Timestamp']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  photo: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  restaurant: Restaurant;
  restaurantId: Scalars['String']['output'];
  updatedAt: Scalars['Timestamp']['output'];
};

export type EditProfileDtoOutput = {
  error?: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
};

export type EditProfileInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
};

export type EditRestaurantInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  categoryName?: InputMaybe<Scalars['String']['input']>;
  coverImg?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  restaurantId: Scalars['String']['input'];
};

export type EditRestaurantOutput = {
  error?: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginOutput = {
  error?: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
  token?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  createAccount: CreateAccountOutput;
  createRestaurant: CreateRestaurantOutput;
  deleteRestarant: DeleteRestaurantOutput;
  editProfile: EditProfileDtoOutput;
  editRestarant: EditRestaurantOutput;
  login: LoginOutput;
  verifyEmail: VerifyEmailOutput;
};


export type MutationCreateAccountArgs = {
  input: CreateAccountInput;
};


export type MutationCreateRestaurantArgs = {
  input: CreateRestaurantInput;
};


export type MutationDeleteRestarantArgs = {
  input: DeleteRestaurantInput;
};


export type MutationEditProfileArgs = {
  input: EditProfileInput;
};


export type MutationEditRestarantArgs = {
  input: EditRestaurantInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationVerifyEmailArgs = {
  input: VerifyEmailInput;
};

export type Query = {
  allCategories: AllCategoriesOutput;
  category: CategoryOutput;
  me: User;
  restaurant: RestaurantOutput;
  restaurants: RestaurantsOutput;
  userProfile: UserProfileOutput;
};


export type QueryCategoryArgs = {
  input: CategoryInput;
};


export type QueryRestaurantArgs = {
  input: RestaurantInput;
};


export type QueryRestaurantsArgs = {
  input: RestaurantsInput;
};


export type QueryUserProfileArgs = {
  userId: Scalars['String']['input'];
};

export type Restaurant = {
  address: Scalars['String']['output'];
  category?: Maybe<Category>;
  coverImg: Scalars['String']['output'];
  createdAt: Scalars['Timestamp']['output'];
  id: Scalars['ID']['output'];
  menu: Array<Dish>;
  name: Scalars['String']['output'];
  owner: User;
  updatedAt: Scalars['Timestamp']['output'];
};

export type RestaurantInput = {
  restaurantId: Scalars['String']['input'];
};

export type RestaurantOutput = {
  error?: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
  restaurant?: Maybe<Restaurant>;
};

export type RestaurantsInput = {
  page?: Scalars['Float']['input'];
};

export type RestaurantsOutput = {
  error?: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
  results?: Maybe<Array<Restaurant>>;
  totalPages?: Maybe<Scalars['Float']['output']>;
  totalResults?: Maybe<Scalars['Float']['output']>;
};

export type User = {
  createdAt: Scalars['Timestamp']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  password: Scalars['String']['output'];
  restaurants: Array<Restaurant>;
  role: UserRole;
  updatedAt: Scalars['Timestamp']['output'];
  verified: Scalars['Boolean']['output'];
};

export type UserProfileOutput = {
  error?: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

/** User roles */
export enum UserRole {
  Client = 'Client',
  Delivery = 'Delivery',
  Owner = 'Owner'
}

export type VerifyEmailInput = {
  code: Scalars['String']['input'];
};

export type VerifyEmailOutput = {
  error?: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
};

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, email: string, role: UserRole, verified: boolean } };

export type CreateAccountMutationVariables = Exact<{
  createAccountInput: CreateAccountInput;
}>;


export type CreateAccountMutation = { createAccount: { ok: boolean, error?: string | null } };

export type LoginMutationVariables = Exact<{
  loginInput: LoginInput;
}>;


export type LoginMutation = { login: { ok: boolean, token?: string | null, error?: string | null } };


export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"verified"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const CreateAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"createAccountInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"createAccountInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<CreateAccountMutation, CreateAccountMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"loginInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"loginInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;