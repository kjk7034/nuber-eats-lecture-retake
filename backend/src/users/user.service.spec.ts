import { Test } from '@nestjs/testing';
import { UserService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserRole } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Model } from 'mongoose';
import { comparePasswords } from './user.utils';

jest.mock('./user.utils', () => ({
  comparePasswords: jest.fn(),
}));

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Model<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(User.name),
          useValue: mockRepository(),
        },
        {
          provide: getModelToken(Verification.name),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
        UserService,
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    usersRepository = module.get<MockRepository<User>>(
      getModelToken(User.name),
    );
    verificationsRepository = module.get<MockRepository<Verification>>(
      getModelToken(Verification.name),
    );
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be definded', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: UserRole.Client,
    };

    it('should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      });

      const result = await service.createAccount(createAccountArgs);

      expect(result).toMatchObject({
        error: '이미 존재하는 email입니다.',
        ok: false,
      });
    });

    it('should create a new user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockResolvedValue(createAccountArgs);
      verificationsRepository.create.mockResolvedValue({ code: 'code-id' });

      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());

      const result = await service.createAccount(createAccountArgs);

      expect(result).toEqual({
        ok: false,
        error: '계정을 생성할 수 없습니다.',
      });
    });
  });

  describe('login', () => {
    const loginArgs = { email: 'test@example.com', password: 'testpassword' };
    let mockSelect: jest.Mock;

    beforeEach(() => {
      mockSelect = jest.fn();
      (usersRepository.findOne as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
    });

    it('should fail if user does not exist', async () => {
      mockSelect.mockResolvedValue(null);
      (comparePasswords as jest.Mock).mockResolvedValue(false);

      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        email: loginArgs.email,
      });
      expect(mockSelect).toHaveBeenCalledWith('+password');
      expect(comparePasswords).toHaveBeenCalledWith(
        loginArgs.password,
        'dummy_hash',
      );
      expect(result).toEqual({ ok: false, error: 'Invalid email or password' });
    });

    it('should fail if password is invalid', async () => {
      const mockUser: Partial<User> = {
        id: 'userid',
        password: 'hashedpassword',
      };
      mockSelect.mockResolvedValue(mockUser);
      (comparePasswords as jest.Mock).mockResolvedValue(false);

      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        email: loginArgs.email,
      });
      expect(mockSelect).toHaveBeenCalledWith('+password');
      expect(comparePasswords).toHaveBeenCalledWith(
        loginArgs.password,
        mockUser.password,
      );
      expect(result).toEqual({ ok: false, error: 'Invalid email or password' });
    });

    it('should return token if credentials are valid', async () => {
      const mockUser: Partial<User> = {
        id: 'userid',
        password: 'hashedpassword',
      };
      mockSelect.mockResolvedValue(mockUser);
      (comparePasswords as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('mocktoken');

      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        email: loginArgs.email,
      });
      expect(mockSelect).toHaveBeenCalledWith('+password');
      expect(comparePasswords).toHaveBeenCalledWith(
        loginArgs.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({ ok: true, token: 'mocktoken' });
    });

    it('should handle database errors', async () => {
      mockSelect.mockRejectedValue(new Error('Database error'));

      const result = await service.login(loginArgs);

      expect(result).toEqual({ ok: false, error: new Error('Database error') });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };

    it('should find an existing user', async () => {
      usersRepository.findById.mockResolvedValue(findByIdArgs);

      const result = await service.findById('1');
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });

    it('should fail if no user if found', async () => {
      usersRepository.findById.mockResolvedValue(null);
      const result = await service.findById('1');
      expect(result).toEqual({ error: 'User Not Found', ok: false });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const newVerification = {
        code: 'code',
      };
      const editProfileArgs = {
        userId: '1',
        input: {
          email: 'aaa@email.com',
        },
      };
      const newUser = {
        email: editProfileArgs.input.email,
        verified: false,
      };

      verificationsRepository.deleteMany.mockResolvedValue(true);
      verificationsRepository.create.mockResolvedValue(newVerification);

      usersRepository.findByIdAndUpdate.mockResolvedValue(newUser);

      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );

      expect(verificationsRepository.deleteMany).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.deleteMany).toHaveBeenCalledWith({
        user: editProfileArgs.userId,
      });

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: editProfileArgs.userId,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        editProfileArgs.input.email,
        newVerification.code,
      );

      expect(usersRepository.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(usersRepository.findByIdAndUpdate).toHaveBeenCalledWith(
        editProfileArgs.userId,
        { $set: { ...newUser } },
        { new: true, runValidators: true },
      );

      expect(result).toEqual({ ok: true });
    });

    it('should change password', async () => {
      const editProfileArgs = {
        userId: '1',
        input: {
          password: 'new.password',
        },
      };
      const newUser = {
        password: editProfileArgs.input.password,
      };
      usersRepository.findByIdAndUpdate.mockResolvedValue(newUser);

      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );

      expect(usersRepository.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(usersRepository.findByIdAndUpdate).toHaveBeenCalledWith(
        editProfileArgs.userId,
        { $set: { ...newUser } },
        { new: true, runValidators: true },
      );

      expect(result).toEqual({ ok: true });
    });

    it('should not delete verification', async () => {
      const editProfileArgs = {
        userId: '1',
        input: {
          email: 'aaa@email.com',
        },
      };

      verificationsRepository.deleteMany.mockRejectedValue(new Error());

      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );

      expect(result.ok).toEqual(false);
    });
  });

  describe('verifyEmail', () => {
    let mockExec: jest.Mock;
    let mockPopulate: jest.Mock;
    let mockFindOne: jest.Mock;

    beforeEach(() => {
      mockExec = jest.fn();
      mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
      mockFindOne = jest.fn().mockReturnValue({ populate: mockPopulate });
      verificationsRepository.findOne = mockFindOne;
    });

    it('should verify email', async () => {
      const mockedUser = { id: 'user-id', verified: false };
      const mockedVerification = {
        code: 'test-code',
        user: mockedUser,
        id: 'verify-id',
      };

      mockExec.mockResolvedValue(mockedVerification);

      await service.verifyEmail('test-code');

      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
      );

      expect(usersRepository.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(usersRepository.findByIdAndUpdate).toHaveBeenCalledWith(
        mockedUser.id,
        { $set: { verified: true } },
        { new: true, runValidators: true },
      );

      expect(verificationsRepository.deleteOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.deleteOne).toHaveBeenCalledWith(
        mockedVerification.id,
      );
    });
    it('should fail on verification not found', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.verifyEmail('test-code');

      expect(result.ok).toEqual(false);
    });

    it('should fail on exceoption', async () => {
      mockExec.mockRejectedValue(new Error('Database error'));

      const result = await service.verifyEmail('test-code');

      expect(result.ok).toEqual(false);
    });
  });
});
