import { Job, Queue, Worker, UnrecoverableError, QueueScheduler } from "bullmq";
import { inject, injectable } from "inversify";
import RedisClient from "../RedisClient";

import EmailSignupInvite from "@floro/mailer/src/templates/EmailSignupInvite";
import VerifyGithubOAuthEmail from "@floro/mailer/src/templates/VerifyGithubOAuthEmail";
import AccountAlreadyExists from "@floro/mailer/src/templates/AccountAlreadyExists";
import LoginEmail from "@floro/mailer/src/templates/LoginEmail";
import SignupEmail from "@floro/mailer/src/templates/SignupEmail";
import OrganizationInvitationEmail from "@floro/mailer/src/templates/OrganizationInvitationEmail";
import PersonalReferralEmail from "@floro/mailer/src/templates/PersonalReferralEmail";

import MailerClient from "@floro/mailer/src/MailerClient";
import MainConfig from "@floro/config/src/MainConfig";

export const EmailTemplates = {
  SignupEmail,
  LoginEmail,
  EmailSignupInvite,
  VerifyGithubOAuthEmail,
  AccountAlreadyExists,
  OrganizationInvitationEmail,
  PersonalReferralEmail
};

interface EmailJobProps<T extends keyof typeof EmailTemplates & string, U> {
  jobId: string;
  from: string;
  to: string;
  subject: string;
  props: U;
  template: T;
}

@injectable()
export default class EmailQueue {
  public static QUEUE_NAME = "email-queue";

  public queue!: Queue;
  public worker!: Worker;
  private mailerClient!: MailerClient;
  public scheduler!: QueueScheduler;
  private mainConfig!: MainConfig;

  constructor(
    @inject(MailerClient) mailerClient: MailerClient,
    @inject(MainConfig) mainConfig: MainConfig
  ) {
    this.mailerClient = mailerClient;
    this.mainConfig = mainConfig;
  }

  public startMailWorker(redisClient: RedisClient): void {
    this.queue = new Queue(EmailQueue.QUEUE_NAME, {
      connection: redisClient.redis,
    });
    this.scheduler = new QueueScheduler(EmailQueue.QUEUE_NAME, {
      connection: redisClient.redis
    });
    this.worker = new Worker(
      EmailQueue.QUEUE_NAME,
      async <T extends keyof typeof EmailTemplates & string, U>(
        job: Job<EmailJobProps<T, U>>
      ) => {
        const Template = EmailTemplates[job.data.template];
        const { html, errors } = this.mailerClient.renderEmail(
          Template({
            ...job?.data?.props,
            assetHost: this.mainConfig.assetHost(),
          } as U | any)
        );
        if (errors?.length > 0) {
          console.error(
            EmailQueue.QUEUE_NAME + ":errors:mjml",
            JSON.stringify(errors)
          );
          throw new UnrecoverableError(
            EmailQueue.QUEUE_NAME + "unrecoverable. rendering issues."
          );
        }
        if (!job?.data.to) {
          console.error(
            EmailQueue.QUEUE_NAME + ":errors:to",
            JSON.stringify(job.data ?? {})
          );
          throw new UnrecoverableError(
            EmailQueue.QUEUE_NAME + "unrecoverable. no to in data"
          );
        }

        if (!job?.data.subject) {
          console.error(
            EmailQueue.QUEUE_NAME + ":errors:subject",
            JSON.stringify(job.data ?? {})
          );
          throw new UnrecoverableError(
            EmailQueue.QUEUE_NAME + "unrecoverable. no subject in data"
          );
        }

        try {
          const info = await this.mailerClient.transporter?.sendMail({
            from: job.data?.from ?? "no-reply@floro.io",
            to: job.data?.to,
            subject: job.data?.subject,
            html
          });
          return info;
        } catch (e) {
          console.error(EmailQueue.QUEUE_NAME + ":errors:transport", e);
          throw new UnrecoverableError(
            EmailQueue.QUEUE_NAME + "unrecoverable. bad transport"
          );
        }
      },
      { autorun: true, connection: redisClient.redis }
    );
    this.worker.on("error", (error: Error) => {
      console.error("Mail Queue Error", error);
    });
  }

  public async add<T extends keyof typeof EmailTemplates & string, U>(
    args: EmailJobProps<T, U>
  ): Promise<void> {
    await this.queue.add(EmailQueue.QUEUE_NAME, args, { jobId: args.jobId });
  }
}