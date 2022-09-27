import { injectable, inject } from "inversify";
import RedisClient from "../RedisClient";
import crypto from 'crypto';
import { User } from '@floro/database/src/entities/User';
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";


const SESSION_STORAGE_PREFIX = "user_session";
const sessionKey = (userId: string, sessionId: string) => `${SESSION_STORAGE_PREFIX}:${userId}:${sessionId}`;
const userSessionIndexKey = (userId: string) => `${SESSION_STORAGE_PREFIX}:${userId}:index`;

const EXPIRATION_SECONDS = 60 * 60 * 24 * 14;

export interface Session {
  id: string;
  clientKey: string;
  userId: string;
  user: User;
  authenticationCredentials: Array<UserAuthCredential>;
  expiresAt: string;
  createdAt: string;
  exchangedAt: string|null;
  exchangeHistory: Array<string>;
}

@injectable()
export default class SessionStore {
    private redisClient!: RedisClient;

    constructor(@inject(RedisClient) redisClient: RedisClient) {
        this.redisClient = redisClient;
    }

    private generateSessionId() {
        return crypto.randomBytes(32).toString('base64');
    }

    private getExpirationDateTime(date: Date): Date {
        return new Date(Math.floor(date.getTime()/1000) * 1000 + (1000 * EXPIRATION_SECONDS));
    }

    public async setNewSession(user: User, credential: UserAuthCredential): Promise<Session> {
        const createdAt = new Date();
        const expiresAt = this.getExpirationDateTime(createdAt);
        const sessionId = this.generateSessionId();
        const key = sessionKey(user.id, sessionId);
        const index = userSessionIndexKey(user.id);
        const session: Session = {
            id: sessionId,
            clientKey: `${user.id}:${sessionId}`,
            userId: user.id,
            user,
            authenticationCredentials: [credential],
            expiresAt: expiresAt.toISOString(),
            createdAt: createdAt.toISOString(),
            exchangedAt: null,
            exchangeHistory: [],
        };
        await this.redisClient.redis
          ?.multi()
          ?.setex(key, EXPIRATION_SECONDS, JSON.stringify(session))
          ?.sadd(index, key)
          ?.exec();
        return session;
    }

    public async fetchSession(clientKey: string): Promise<Session|null> {
        const key = `${SESSION_STORAGE_PREFIX}:${clientKey}`;
        const serializedSession = await this.redisClient.redis?.get(key);
        if (serializedSession) {
            return JSON.parse(serializedSession) as Session;
        }
        return null;
    }

    public async fetchAllUserSessions(userId: string): Promise<Array<Session>> {
        const index = userSessionIndexKey(userId);
        const sessionIds = await this.redisClient?.redis?.smembers?.(index) ?? [];
        const storedSessions = await Promise.all(sessionIds?.map(async (key): Promise<string|null|undefined> => {
            return await this.redisClient?.redis?.get(key);
        }));
        const sessions = storedSessions?.filter((storedSession?: string|null) => {
            if (!storedSession) {
                return false;
            }
            return true;
        })?.map((serializedSession): Session => JSON.parse(serializedSession as string)) ?? [];

        return sessions?.sort((a, b) => {
            const aExpiration = new Date(a.expiresAt);
            const bExpiration = new Date(b.expiresAt);
            if (aExpiration.getTime() == bExpiration.getTime()) {
                return a.exchangeHistory.length - b.exchangeHistory.length;
            }
            return aExpiration.getTime() - bExpiration.getTime();
        });
    }

    public async exchangeSession(session: Session): Promise<Session> {
        const index = userSessionIndexKey(session.userId);
        const exchangedAt = new Date();
        const expiresAt = this.getExpirationDateTime(exchangedAt);
        const sessionId = this.generateSessionId();
        const key = sessionKey(session.userId, sessionId);
        const exchangeSession: Session = {
            id: sessionId,
            clientKey: `${session.userId}:${sessionId}`,
            userId: session.userId,
            user: session.user,
            authenticationCredentials: session.authenticationCredentials,
            expiresAt: expiresAt.toISOString(),
            createdAt: session.createdAt,
            exchangedAt: exchangedAt.toISOString(),
            exchangeHistory: [session.id, ...session.exchangeHistory],
        };
        await this.redisClient.redis?.multi()
        .setex(key, EXPIRATION_SECONDS, JSON.stringify(exchangeSession))
        .sadd(index, key)
        .exec();
        return exchangeSession;
    }

    public async updateSessionUser(session: Session, user: User): Promise<Session> {
        if (user.id != session.userId) {
            return session;
        }
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        const ttl = Math.floor((expiresAt.getTime() - now.getTime())/1000);
        const key = `${SESSION_STORAGE_PREFIX}:${session.userId}}:${session.id}`;
        const updatedSession: Session = {
            ...session,
            user
        };
        await this.redisClient.redis?.setex(key, ttl, JSON.stringify(updatedSession));
        return updatedSession;
    }

    public async addAuthenticationCredential(session: Session, user: User, authenticationCredential: UserAuthCredential): Promise<Session> {
        if (user.id != session.userId) {
            return session;
        }
        if (authenticationCredential.userId != session.userId) {
            return session;
        }
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        const ttl = Math.floor((expiresAt.getTime() - now.getTime())/1000);
        const key = sessionKey(session.userId, session.id);
        const updatedSession: Session = {
            ...session,
            authenticationCredentials: [...session.authenticationCredentials.filter(credential => {
                return credential.id != authenticationCredential.id;
            }), authenticationCredential]
        };
        await this.redisClient.redis?.setex(key, ttl, JSON.stringify(updatedSession));
        return updatedSession;
    }

    public async deleteSession(session: Session): Promise<void> {
        const key = sessionKey(session.userId, session.id);
        const index = userSessionIndexKey(session.userId);
        await this.redisClient?.redis?.multi().srem(index, key).del(key).exec();
    }

    public async deleteAllUserSessions(userId: string): Promise<void> {
        const sessions = await this.fetchAllUserSessions(userId);
        await Promise.all(sessions.map(session => this.deleteSession(session)));
    }
}