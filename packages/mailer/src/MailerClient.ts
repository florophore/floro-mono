import { inject, injectable } from "inversify";
import MailerClientConfig from "./MailerClientConfig";
import nodemailer, { Transporter } from 'nodemailer';
import { render } from 'mjml-react';
import { env} from 'process';
import MockTransport from "./test/test_utils/MockTransport";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import * as  aws from "@aws-sdk/client-ses";

const isDevelopment = env.NODE_ENV == 'development';
const isProduction = env.NODE_ENV == 'production';
const isTest = env.NODE_ENV == 'test';

if (!isProduction) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

@injectable()
export default class MailerClient {

    private clientConfig!: MailerClientConfig;
    public transporter?: Transporter<SMTPTransport.SentMessageInfo>;

    constructor(@inject(MailerClientConfig) clientConfig: MailerClientConfig) {
        this.clientConfig = clientConfig;
        if (isProduction) {
          this.clientConfig;
          /*TODO: Add SES transporter*/
          const ses = new aws.SESClient({
            apiVersion: "2010-12-01",
            region: env.AWS_S3_REGION ?? "us-east-1",
            credentials:{
              accessKeyId: env.AWS_ACCESS_KEY_ID ?? "",
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? ""
            }
          });

          this.transporter = nodemailer.createTransport({
            SES: { ses, aws }
          });
          return;
        }
        // update for prod to point at SES
        if (isDevelopment) {
          this.transporter = nodemailer.createTransport({
            host: "localhost",
            port: 1025,
            secure: false, // true for 465, false for other ports
            tls: {
              rejectUnauthorized: false,
            },
          });
        }

        if (isTest) {
          this.transporter = new MockTransport();
        }
    }

    public renderEmail(jsx: React.ReactElement) {
        if (isDevelopment) {
            return render(jsx, {validationLevel: 'strict'});
        }
        return render(jsx, {validationLevel: 'soft'});
    }
}