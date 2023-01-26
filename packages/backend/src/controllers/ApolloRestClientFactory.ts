import { inject, injectable } from "inversify";
import { GraphQLSchema } from "graphql";
import SessionStore, { Session } from "@floro/redis/src/sessions/SessionStore";
import { User } from "@floro/database/src/entities/User";
import { SchemaLink } from "@apollo/client/link/schema";
// eslint-disable-next-line
import ApolloPkg from "@apollo/client";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import RequestCache from "../request/RequestCache";
const { ApolloClient, InMemoryCache } = ApolloPkg;

export interface FloroGraphQLContext {
  authorizationToken?: string;
  currentUser: User | null;
  session: Session | null;
  should404: boolean;
  isSSR: boolean;
  cacheKey?: string;
}

@injectable()
export default class ApolloRestClientFactory {
  private schema!: GraphQLSchema;

  public sessionStore: SessionStore;
  public contextFactory: ContextFactory;
  private requestCache!: RequestCache;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(SessionStore) sessionStore: SessionStore,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    this.requestCache = requestCache;
    this.sessionStore = sessionStore;
    this.contextFactory = contextFactory;
  }

  public setSchema(schema: GraphQLSchema) {
    this.schema = schema;
  }

  public async createSessionContext(sessionKey?: string): Promise<{
    session: Session | null;
    currentUser: User | null;
    authorizationToken?: string;
  }> {
    if (sessionKey && (sessionKey?.length ?? 0) == 0) {
      return {
        session: null,
        currentUser: null,
        authorizationToken: sessionKey,
      };
    }

    try {
      const currentSession = await this.sessionStore.fetchSession(
        sessionKey as string
      );
      const usersContext = await this.contextFactory.createContext(
        UsersContext
      );

      const user = await usersContext.getById(currentSession?.userId as string);
      return {
        session: currentSession,
        currentUser: user,
        authorizationToken: sessionKey,
      };
    } catch (e) {
      return {
        session: null,
        currentUser: null,
        authorizationToken: sessionKey,
      };
    }
  }

  public createApolloRestClient(sessionContext: {
    session: Session | null;
    currentUser: User | null;
    authorizationToken?: string;
  }) {
    const cacheKey = this.requestCache.init();
    const context = {
      authorizationToken: sessionContext?.authorizationToken,
      currentUser: sessionContext?.currentUser,
      session: sessionContext?.session,
      should404: false,
      isSSR: true,
      cacheKey,
    };
    return new ApolloClient({
      ssrMode: true,
      link: new SchemaLink({
        schema: this.schema,
        context,
      }),
      cache: new InMemoryCache(),
    });
  }

  public async runWithApolloClient(
    sessionKey: string,
    callback: (
      ctx: FloroGraphQLContext,
      apolloClient: ApolloPkg.ApolloClient<ApolloPkg.NormalizedCacheObject>
    ) => Promise<void>
  ): Promise<void> {
    const sessionContext = await this.createSessionContext(sessionKey);
    const cacheKey = this.requestCache.init();
    try {
      const context = {
        authorizationToken: sessionContext?.authorizationToken,
        currentUser: sessionContext?.currentUser,
        session: sessionContext?.session,
        should404: false,
        isSSR: true,
        cacheKey,
      };
      const apolloClient = new ApolloClient({
        ssrMode: true,
        link: new SchemaLink({
          schema: this.schema,
          context,
        }),
        cache: new InMemoryCache(),
      });
      await callback(context, apolloClient);
      this.requestCache.release(cacheKey);
    } catch (e) {
      this.requestCache.release(cacheKey);
    }
  }
}