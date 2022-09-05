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
        let testAccount = await nodemailer.createTestAccount();
        // create reusable transporter object using the default SMTP transport
        if (env.NODE_ENV == 'development' || env.NODE_ENV == 'test') {
            this.transporter = nodemailer.createTransport({
              host: "smtp.ethereal.email",
              port: 1025,
              secure: false, // true for 465, false for other ports
              auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
              },
            });
        }

    }
}