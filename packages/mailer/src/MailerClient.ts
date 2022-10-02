import { inject, injectable } from "inversify";
import MailerClientConfig from "./MailerClientConfig";
import nodemailer from 'nodemailer';
import { render } from 'mjml-react';
import { env} from 'process';
import MockTransport from "./test/test_utils/MockTransport";

const isDevelopment = env.NODE_ENV == 'development';
const isProduction = env.NODE_ENV == 'production';
const isTest = env.NODE_ENV == 'test';

if (!isProduction) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

@injectable()
export default class MailerClient {

    private clientConfig!: MailerClientConfig;
    public transporter?;

    constructor(@inject(MailerClientConfig) clientConfig: MailerClientConfig) {
        this.clientConfig = clientConfig;
    }

    public renderEmail(jsx: React.ReactElement) {
        if (isDevelopment) {
            return render(jsx, {validationLevel: 'strict'});
        }
        return render(jsx, {validationLevel: 'soft'});
    }

    public async startMailTransporter(): Promise<void> {
        if (isProduction) {
            this.clientConfig;
            /*TODO: Add SES transporter*/
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
}