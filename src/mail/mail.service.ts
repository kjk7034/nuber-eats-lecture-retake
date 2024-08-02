import { Inject, Injectable } from '@nestjs/common';
import { Recipient, EmailParams, MailerSend, Sender } from 'mailersend';
import { MAIL_CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interfaces';
import { VariableSubstitution } from 'mailersend/lib/modules/Email.module';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private mailersend: MailerSend;
  private sender: Sender;

  constructor(
    @Inject(MAIL_CONFIG_OPTIONS) private readonly options: MailModuleOptions,
    private configService: ConfigService,
  ) {
    this.mailersend = new MailerSend({
      apiKey: this.options.apiToken,
    });

    this.sender = new Sender(this.options.fromEmail, this.options.fromName);
  }

  async sendEmail(
    subject: string,
    templateId: string,
    substitutions: VariableSubstitution[],
  ): Promise<boolean> {
    const to = 'kjk7034@naver.com';

    const variables = [
      {
        email: to,
        substitutions,
      },
    ];

    // const recipients = Array.isArray(to)
    //   ? to.map((email) => new Recipient(email))
    //   : [new Recipient(to)];

    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(this.sender)
      .setTo(recipients)
      .setReplyTo(this.sender)
      .setSubject(subject)
      .setTemplateId(templateId)
      .setVariables(variables);

    try {
      await this.mailersend.email.send(emailParams);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    const serverUrl = this.configService.get('SERVER_URL');

    this.sendEmail('Verify Your Email', this.options.templateVerification, [
      {
        var: 'action_url',
        value: `${serverUrl}/confirm?code=${code}`,
      },
      {
        var: 'senderName',
        value: this.sender.name,
      },
      {
        var: 'username',
        value: email,
      },
    ]);
  }
}
