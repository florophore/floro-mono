import { injectable, inject } from "inversify";
import RedisClient from "../RedisClient";
import crypto from 'crypto';
import EmailHelper from '@floro/database/src/contexts/utils/EmailHelper';
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import MainConfig from "@floro/config/src/MainConfig";

const SIGNUP_EXCHANGE_STORE_PREFIX = "signup_exchange_store";
const  signupExchangeStoreKey = (storeId: string) => `${SIGNUP_EXCHANGE_STORE_PREFIX}:${storeId}`;

const EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // 1 week

export interface SignUpExchange {
  id: string;
  credentialId: string;
  expiresAt: string;
  createdAt: string;
}

@injectable()
export default class SignupExchangStore {
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

    public async createSignupExchange(credential: UserAuthCredential) {
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + EXPIRATION_SECONDS * 1000);
        const storeId = this.generateStoreId();
        const exchangeKey = signupExchangeStoreKey(storeId);
        const signupExchange: SignUpExchange = {
            id: storeId,
            credentialId: credential.id,
            createdAt: createdAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
        };
        await this.redisClient?.redis?.setex(exchangeKey, EXPIRATION_SECONDS, JSON.stringify(signupExchange));
        return signupExchange;
    }

    public async fetchSignupExchange(storeId: string): Promise<SignUpExchange|null> {
        const signupExchangeKey = signupExchangeStoreKey(storeId);
        const signupExchangeSerialized = await this.redisClient?.redis?.get(signupExchangeKey) as string|undefined;
        if (signupExchangeSerialized) {
            return JSON.parse(signupExchangeSerialized) as SignUpExchange;
        }
        return null;
    }
}