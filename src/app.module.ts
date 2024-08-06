import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { JwtModule } from './jwt/jwt.module';
import * as Joi from 'joi';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test'),
        DB_URI: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAIL_API_TOKEN: Joi.string().required(),
        MAIL_FROM_EMAIL: Joi.string().required(),
        MAIL_FROM_NAME: Joi.string().required(),
        MAIL_TEMPLATE_VERIFICATION: Joi.string().required(),
      }),
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      buildSchemaOptions: {
        dateScalarMode: 'timestamp',
      },
      context: ({ req }) => ({ user: req['user'] }),
    }),
    MailModule.forRoot({
      apiToken: process.env.MAIL_API_TOKEN,
      fromEmail: process.env.MAIL_FROM_EMAIL,
      fromName: process.env.MAIL_FROM_NAME,
      templateVerification: process.env.MAIL_TEMPLATE_VERIFICATION,
    }),
    JwtModule.forRoot({ privateKey: process.env.PRIVATE_KEY }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/graphql',
      method: RequestMethod.POST,
    });
  }
}
