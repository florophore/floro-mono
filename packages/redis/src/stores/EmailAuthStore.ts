import { injectable, inject } from "inversify";
import RedisClient from "../RedisClient";
import crypto from 'crypto';
import EmailHelper from '@floro/database/src/contexts/utils/EmailHelper';

const EMAIL_SIGNUP_STORE_PREFIX = "email_signup_store";
const  emailSignupStoreKey = (storeId: string) => `${EMAIL_SIGNUP_STORE_PREFIX}:${storeId}`;

const EXPIRATION_SECONDS = 60 * 60; // 1 hour

export interface EmailSignup {
  id: string;
  ackKey: string;
  email: string;
  normalizedEmail: string;
  emailHash: string;
  expiresAt: string;
  createdAt: string;
}

@injectable()
export default class EmailAuthStore {
    private redisClient!: RedisClient;

    constructor(@inject(RedisClient) redisClient: RedisClient) {
        this.redisClient = redisClient;
    }

    private generateStoreId(): string {
        return crypto.randomBytes(32).toString('base64');
    }

    private generateAckKey(): string {
        return crypto.randomBytes(32).toString('base64');
    }

    public async createEmailSignup(email: string) {
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + EXPIRATION_SECONDS * 1000);
        const isGoogleEmail = await EmailHelper.isGoogleEmail(email);
        const normalizedEmail = EmailHelper.getUniqueEmail(email, isGoogleEmail);
        const emailHash = EmailHelper.getEmailHash(email, isGoogleEmail);
        const storeId = this.generateStoreId();
        const ackKey = this.generateAckKey();
        const emailSignupKey = emailSignupStoreKey(storeId);
        const emailSignup: EmailSignup = {
            id: storeId,
            ackKey,
            email,
            normalizedEmail,
            createdAt: createdAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            emailHash
        };
        await this.redisClient?.redis?.setex(emailSignupKey, EXPIRATION_SECONDS, JSON.stringify(emailSignup));
        return emailSignup;
    }

    public async fetchEmailSignup(storeId: string): Promise<EmailSignup|null> {
        const emailSignupKey = emailSignupStoreKey(storeId);
        const emailSignupSerialized = await this.redisClient?.redis?.get(emailSignupKey) as string|undefined;
        if (emailSignupSerialized) {
            return JSON.parse(emailSignupSerialized) as EmailSignup;
        }
        return null;
    }
}