import { inject, injectable } from "inversify";
import MailerClientConfig from "./MailerClientConfig";
import nodemailer from 'nodemailer';
import { env} from 'process';

if (env.NODE_ENV == 'development' || env.NODE_ENV == 'test') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

@injectable()
export default class MailerClient {

    private clientConfig!: MailerClientConfig;
    public transporter?;

    constructor(@inject(MailerClientConfig) clientConfig: MailerClientConfig) {
        this.clientConfig = clientConfig;
    }


    public async startMailTransporter(): Promise<void> {
        // update for prod to point at SES
        if (env.NODE_ENV == 'development' || env.NODE_ENV == 'test') {
            this.transporter = nodemailer.createTransport({
              host: "localhost",
              port: 1025,
              secure: false, // true for 465, false for other ports
              tls: {
                rejectUnauthorized: false,
              },
            });
        }
    }
}