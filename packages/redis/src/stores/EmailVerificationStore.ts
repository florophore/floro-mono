import { injectable, inject } from "inversify";
import RedisClient from "../RedisClient";
import crypto from 'crypto';
import EmailHelper from '@floro/database/src/contexts/utils/EmailHelper';
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import MainConfig from "@floro/config/src/MainConfig";

const EMAIL_VERIFICATION_STORE_PREFIX = "email_verification_store";
const  emailVerificationStoreKey = (storeId: string) => `${EMAIL_VERIFICATION_STORE_PREFIX}:${storeId}`;

const EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // 1 week

export interface EmailVerification {
  id: string;
  oauthId: string;
  email: string;
  normalizedEmail: string;
  emailHash: string;
  expiresAt: string;
  createdAt: string;
}

@injectable()
export default class EmailVerificationStore {
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

    public async createEmailVerification(oauthCredential: UserAuthCredential) {
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + EXPIRATION_SECONDS * 1000);
        const isGoogleEmail = await EmailHelper.isGoogleEmail(oauthCredential.email);
        const normalizedEmail = EmailHelper.getUniqueEmail(oauthCredential.email, isGoogleEmail);
        const emailHash = EmailHelper.getEmailHash(oauthCredential.email, isGoogleEmail);
        const storeId = this.generateStoreId();
        const emailSignupKey = emailVerificationStoreKey(storeId);
        const emailSignup: EmailVerification = {
            id: storeId,
            email: oauthCredential.email,
            oauthId: oauthCredential.id,
            normalizedEmail,
            createdAt: createdAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            emailHash
        };
        await this.redisClient?.redis?.setex(emailSignupKey, EXPIRATION_SECONDS, JSON.stringify(emailSignup));
        return emailSignup;
    }

    public async fetchEmailVerification(storeId: string): Promise<EmailVerification|null> {
        const emailSignupKey = emailVerificationStoreKey(storeId);
        const emailSignupSerialized = await this.redisClient?.redis?.get(emailSignupKey) as string|undefined;
        if (emailSignupSerialized) {
            return JSON.parse(emailSignupSerialized) as EmailVerification;
        }
        return null;
    }

    public link(emailVerification: EmailVerification, loginClient: 'cli'|'web'|'desktop') {
        return encodeURI(
          `${this.mainConfig.url()}/credential/verify?verification_code=${
            emailVerification.id
          }&login_client=${loginClient}`
        );
    }
}