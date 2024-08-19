import { Test } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MAIL_CONFIG_OPTIONS } from 'src/common/common.constants';
import { ConfigService } from '@nestjs/config';
import { Recipient, EmailParams } from 'mailersend';

const mockMailModuleOptions = {
  apiToken: 'test-api-token',
  fromEmail: 'test-from-email',
  fromName: 'test-from-name',
  templateVerification: 'test-template-verification',
};
const SERVER_URL = 'http://test-server.com';

type MockMailerSend = {
  email: {
    send: jest.Mock;
  };
};

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

describe('MailService', () => {
  let service: MailService;
  let configService: jest.Mocked<ConfigService>;
  let mailerSendMock: MockMailerSend;

  beforeEach(async () => {
    configService = {
      get: jest.fn(() => SERVER_URL),
    } as unknown as jest.Mocked<ConfigService>;

    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: MAIL_CONFIG_OPTIONS,
          useValue: mockMailModuleOptions,
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
    mailerSendMock = (service as any).mailersend as MockMailerSend;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sendVerificationEmail', () => {
    const sendVerificationEmailArgs = {
      email: 'email',
      code: 'code',
    };

    const sendEmailSpy = jest
      .spyOn(service, 'sendEmail')
      .mockResolvedValue(true);

    service.sendVerificationEmail(
      sendVerificationEmailArgs.email,
      sendVerificationEmailArgs.code,
    );

    expect(sendEmailSpy).toHaveBeenCalledTimes(1);
    expect(sendEmailSpy).toHaveBeenCalledWith(
      'Verify Your Email',
      mockMailModuleOptions.templateVerification,
      [
        {
          var: 'action_url',
          value: `${SERVER_URL}/confirm?code=${sendVerificationEmailArgs.code}`,
        },
        {
          var: 'senderName',
          value: mockMailModuleOptions.fromName,
        },
        {
          var: 'username',
          value: sendVerificationEmailArgs.email,
        },
      ],
    );
  });

  describe('sendEmail', () => {
    const SUBJECT = 'Test Subject';
    const TEMPLATE_ID = 'test-template-id';
    const SUBSTITUTIONS = [{ var: 'test', value: 'value' }];

    it('should send email with correct parameters', async () => {
      const ok = await service.sendEmail(SUBJECT, TEMPLATE_ID, SUBSTITUTIONS);

      expect(Recipient).toHaveBeenCalledTimes(1);
      expect(EmailParams).toHaveBeenCalled();

      expect(ok).toEqual(true);
    });
  });

  it('should handle errors when sending email', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const error = new Error('Send email error');
    mailerSendMock.email.send.mockRejectedValueOnce(error);

    await service.sendEmail('Subject', 'template-id', []);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });
});
