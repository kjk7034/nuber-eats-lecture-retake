# [풀스택] 우버 이츠 클론코딩

3년 전에 [[풀스택] 우버 이츠 클론코딩](https://nomadcoders.co/nuber-eats/lobby) 강의를 수강했었다. 또한, [챌린지 5기](https://nomadcoders.co/community/thread/1290)도 완료!! (nanofe).

그 후 백엔드 개발을 하지 않아서 많은 것을 잊어버렸고, 백엔드 개발을 해야 할 기회가 생겨 재수강을 하면서 다시 정리를!!

## 학습 메모

### 2강 GRAPHQL API

버전 차이로 GraphQLModule driver가 추가 되었다.

### 3강 DATABASE CONFIGURATION

강의에서는 TypeORM + PostgreSQL을 사용했지만, MongoDB를 활용해보기 위해서 [Nest JS Mongo](https://docs.nestjs.com/techniques/mongodb)를 참고해서 적용했다.

TypeORM을 이용해서 MongoDB를 사용할 수 있지만, TypeORM이 주로 관계형 데이터베이트에 최적화 되어 있다고 알고 있어서 Mongoose를 택함.

### 5강 USER CRUD

bcrypt를 적용하는 과정에서 강의는 TypeORM을 사용하니 `@BeforeInsert`를 사용했지만, mongo에서 1. 스키마 파일에서 직접 정의, 2. 모듈에서 정의하는 방법 중 1번을 선택했다. 이유는 스키마와 관련된 모든 로직이 한 파일에 모여 있어 관리가 쉽다고 생각함.

```typescript
// 1. 스키마 파일에서 직접 정의 (user.entity.ts)
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (e) {
    return next(e);
  }
});

// 2. 모듈에서 정의 (users.module.ts)
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
          schema.pre('save', async function (next) {
            // ... 비밀번호 해싱 로직 ...
          });
          return schema;
        },
      },
    ]),
  ],
})
```

### 6강 USER AUTHENTICATION

#### NestJS에서 Middleware 사용하는 방법 (jwtMiddleWare예시)

1. bootstrap에 적용

```typescript
async function bootstrap() {
  // ...
  app.use(jwtMiddleware);
  // ...
}
```

2. AppModule에 적용

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 함수(jwtMiddleware)나 Class(JwtMiddleware) 적용
    consumer.apply(jwtMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}

// 함수
export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(req.headers);
  next();
}

// Class
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('req', req.headers);
    next();
  }
}
```

#### TypeORM BeforeInsert, BeforeUpdate 처리

`UserSchema.pre`를 이용

```typescript
// ./src/users/entities/user.entity.ts

// TypeORM BeforeInsert
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await hashPassword(this.password);
    return next();
  } catch (e) {
    return next(e);
  }
});

// TypeORM BeforeUpdate
UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as UpdateQuery<User>;
  if (update.$set && update.$set.password) {
    try {
      update.$set.password = await hashPassword(update.$set.password);
    } catch (error) {
      return next(error);
    }
  }
  return next();
});
```

`16.15`강의에 있지만 BeforeUpdate 사용 시 password를 변환하지 않음. 그래서 TypeORM에서 postgresql 사용 시, update대신 findOne, save 사용.

### 7강 EMAIL VERIFICATION

typeorm에서는 JoinColumn을 사용하지만 mongoose에서는 Types.ObjectId를 사용함.

```typescript
  @Prop({ type: Types.ObjectId, ref: 'User' })
  @Field(() => User)
  user: User;
```

TypeORM의 onDelete: 'CASCADE'와 같은 기능은 Mongoose에서 자동으로 제공되지 않음.
만약 구현한다면, 다음과 같이 구현할 수 있음.

```typescript
// TypeORM onDelete: 'CASCADE' 와 비슷한 기능 구현 샘플
UserSchema.pre<Query<any, User>>('findOneAndDelete', async function (next) {
  try {
    const user = (await this.model.findOne(this.getFilter())) as User | null;
    if (user) {
      const VerificationModel: Model<Verification> = new this.model(
        'Verification',
      );
      await VerificationModel.deleteOne({ user: user.id });
    }
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error('Unknown error'));
  }
});
```

강의에서는 `Mailgun`을 사용해서 직접 구현했지만, 나는 `mailersend`를 적용해봄.

템플릿도 쉽게 적용할 수 있었음.