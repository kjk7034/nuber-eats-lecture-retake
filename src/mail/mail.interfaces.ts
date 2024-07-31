export interface MailModuleOptions {
  apiToken: string;
  fromEmail: string;
  fromName: string;
  templateVerification: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  variables?: Array<{
    email: string;
    substitutions: Array<{ var: string; value: string }>;
  }>;
}
