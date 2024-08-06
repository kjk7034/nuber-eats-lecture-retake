import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';

jest.mock('mailersend', () => {
  const mMailerSend = {
    email: {
      send: jest.fn().mockResolvedValue({}),
    },
  };
  const mEmailParams = {
    setFrom: jest.fn().mockReturnThis(),
    setTo: jest.fn().mockReturnThis(),
    setReplyTo: jest.fn().mockReturnThis(),
    setSubject: jest.fn().mockReturnThis(),
    setTemplateId: jest.fn().mockReturnThis(),
    setVariables: jest.fn().mockReturnThis(),
  };
  return {
    MailerSend: jest.fn(() => mMailerSend),
    Recipient: jest.fn((email) => ({ email })),
    EmailParams: jest.fn(() => mEmailParams),
    Sender: jest.fn((email, name) => ({ email, name })),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

const TEST_USER = {
  EMAIL: 'test2@email.com',
  PASSWORD: 'password',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Model<User>;
  let verificationRepository: Model<Verification>;
  let jwtToken: string;
  let connection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get(getModelToken(User.name));
    verificationRepository = module.get(getModelToken(Verification.name));
    await app.init();

    connection = await module.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await app.close();
  });

  describe('createAccount', () => {
    it('should create account', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          createAccount(input:{
            email:"${TEST_USER.EMAIL}",
            password:"${TEST_USER.PASSWORD}",
            role : Client
          }) {
            ok
            error
          }
        }`,
        })
        .expect(200);

      const { ok, error } = response.body.data.createAccount;

      expect(ok).toBe(true);
      expect(error).toBe(null);
    });

    it('should fail if account already exists', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          createAccount(input:{
            email:"${TEST_USER.EMAIL}",
            password:"${TEST_USER.PASSWORD}",
            role : Client
          }) {
            ok
            error
          }
        }`,
        })
        .expect(200);

      const { ok, error } = response.body.data.createAccount;

      expect(ok).toBe(false);
      expect(error).toBe('이미 존재하는 email입니다.');
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(
                input:{
                  email:"${TEST_USER.EMAIL}",
                  password:"${TEST_USER.PASSWORD}" 
                }
              ) {
                error
                ok
                token
              }
            }
          `,
        })
        .expect(200);

      const { ok, error, token } = response.body.data.login;

      expect(ok).toBe(true);
      expect(error).toBe(null);
      expect(token).toEqual(expect.any(String));

      jwtToken = token;
    });
    it('should not be able to login with wrong credentials', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(
                input:{
                  email:"${TEST_USER.EMAIL}",
                  password:"${TEST_USER.PASSWORD}123" 
                }
              ) {
                error
                ok
                token
              }
            }
          `,
        })
        .expect(200);

      const { ok, error } = response.body.data.login;

      expect(ok).toBe(false);
      expect(error).toBe('Invalid email or password');
    });
  });

  describe('userProfile', () => {
    let userId: string;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });
    it("should see a user's profile", async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
          {
            userProfile(userId:"${userId}"){
              ok
              error
              user {
                id
              }
            }
          }
          `,
        })
        .expect(200);
      const { ok, error, user } = response.body.data.userProfile;
      expect(ok).toBe(true);
      expect(error).toBe(null);
      expect(user.id).toEqual(userId);

      return response;
    });
    it('should not find a profile', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
          {
            userProfile(userId:"12345"){
              ok
              error
              user {
                id
              }
            }
          }
          `,
        })
        .expect(200);

      const { ok, error, user } = response.body.data.userProfile;
      expect(ok).toBe(false);
      expect(error).toBe('User Not Found');
      expect(user).toEqual(null);

      return response;
    });
  });

  describe('me', () => {
    it('should find my profile', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
          {
            me {
              email
            }
          }
          `,
        })
        .expect(200);

      const { email } = response.body.data.me;
      expect(email).toBe(TEST_USER.EMAIL);
      return response;
    });

    it('should not allow logged out user', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          {
            me {
              email
            }
          }
          `,
        })
        .expect(200);

      const { errors } = response.body;
      const [error] = errors;
      expect(error.message).toBe('Forbidden resource');

      return response;
    });
  });

  describe('editProfile', () => {
    const NEW_EMAIL = 'em12@email.com';
    it('should change email', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
          mutation {
            editProfile(input:{
              email: "${NEW_EMAIL}",
            }) {
              ok
              error
            }
          }
        `,
        })
        .expect(200);

      const { ok, error } = response.body.data.editProfile;

      expect(ok).toBe(true);
      expect(error).toBe(null);
      return response;
    });

    it('should have new email', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
          {
            me {
              email
            }
          }
          `,
        })
        .expect(200);

      const { email } = response.body.data.me;

      expect(email).toBe(NEW_EMAIL);
      return response;
    });
  });

  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationRepository.find();
      verificationCode = verification.code;
    });
    it('should verify email', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
            mutation {
              verifyEmail(input:{
                code:"${verificationCode}"
              }){
                ok
                error
              }
            }
          `,
        })
        .expect(200);
      const { ok, error } = response.body.data.verifyEmail;
      expect(ok).toBe(true);
      expect(error).toBe(null);
    });
    it('should fail on verification code not found', async () => {
      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
            mutation {
              verifyEmail(input:{
                code:"xxx"
              }){
                ok
                error
              }
            }
          `,
        })
        .expect(200);

      const { ok, error } = response.body.data.verifyEmail;

      expect(ok).toBe(false);
      expect(error).toBe('Verification not found.');
    });
  });
});
