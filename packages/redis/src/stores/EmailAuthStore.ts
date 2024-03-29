import { injectable, inject } from "inversify";
import RedisClient from "../RedisClient";
import crypto from 'crypto';
import EmailHelper from '@floro/database/src/contexts/utils/EmailHelper';
import MainConfig from "@floro/config/src/MainConfig";

const EMAIL_AUTH_STORE_PREFIX = "email_auth_store";
const  emailAuthStoreKey = (storeId: string) => `${EMAIL_AUTH_STORE_PREFIX}:${storeId}`;

const EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // 1 week

export interface EmailSignup {
  id: string;
  email: string;
  normalizedEmail: string;
  firstName?: string;
  lastName?: string;
  emailHash: string;
  expiresAt: string;
  createdAt: string;
}

@injectable()
export default class EmailAuthStore {
    private redisClient!: RedisClient;
    private mainConfig!: MainConfig;

    constructor(
        @inject(RedisClient) redisClient: RedisClient,
        @inject(MainConfig) mainConfig: MainConfig
        ) {
        this.redisClient = redisClient;
        this.mainConfig = mainConfig;
    }

    private generateStoreId(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    public async createEmailAuth(email: string, firstName?: string, lastName?: string) {
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + EXPIRATION_SECONDS * 1000);
        const isGoogleEmail = await EmailHelper.isGoogleEmail(email);
        const normalizedEmail = EmailHelper.getUniqueEmail(email, isGoogleEmail);
        const emailHash = EmailHelper.getEmailHash(email, isGoogleEmail);
        const storeId = this.generateStoreId();
        const emailSignupKey = emailAuthStoreKey(storeId);
        const emailSignup: EmailSignup = {
            id: storeId,
            email,
            normalizedEmail,
            firstName: firstName ?? "",
            lastName: lastName ?? "",
            createdAt: createdAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            emailHash
        };
        await this.redisClient?.redis?.setex(emailSignupKey, EXPIRATION_SECONDS, JSON.stringify(emailSignup));
        return emailSignup;
    }

    public async fetchEmailAuth(storeId: string): Promise<EmailSignup|null> {
        const emailSignupKey = emailAuthStoreKey(storeId);
        const emailSignupSerialized = await this.redisClient?.redis?.get(emailSignupKey) as string|undefined;
        if (emailSignupSerialized) {
            return JSON.parse(emailSignupSerialized) as EmailSignup;
        }
        return null;
    }

    public link(emailSignup: EmailSignup, loginClient: 'cli'|'web'|'desktop') {
        return encodeURI(
        `${this.mainConfig.url()}/credential/auth?authorization_code=${emailSignup.id}&login_client=${loginClient}`
        );
    }
}