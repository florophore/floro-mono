import { inject, injectable } from "inversify";
import BaseController from "./BaseController";
import { Post } from "./annotations/HttpDecorators";
import AuthenticationService from "../services/authentication/AuthenticationService";
import EmailValidator from "email-validator";
import SessionStore from "@floro/redis/src/sessions/SessionStore";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import MainConfig from "@floro/config/src/MainConfig";
import ApolloRestClientFactory from "./ApolloRestClientFactory";
import {
  ExchangeSessionDocument,
} from "@floro/graphql-schemas/build/generated/main-client-graphql";

export interface CreateLoginOrSignupRequest {
  email?: string;
}

@injectable()
export default class AuthenticationController extends BaseController {
  public authenticationService: AuthenticationService;
  public sessionStore: SessionStore;
  public contextFactory: ContextFactory;
  public mainConfig: MainConfig;
  public apolloRestClientFactory: ApolloRestClientFactory;

  constructor(
    @inject(AuthenticationService) authenticationService: AuthenticationService,
    @inject(SessionStore) sessionStore: SessionStore,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(MainConfig) mainConfig: MainConfig,
    @inject(ApolloRestClientFactory)
    apolloRestClientFactory: ApolloRestClientFactory
  ) {
    super();
    this.authenticationService = authenticationService;
    this.sessionStore = sessionStore;
    this.contextFactory = contextFactory;
    this.mainConfig = mainConfig;
    this.apolloRestClientFactory = apolloRestClientFactory;
  }

  @Post("/api/authenticate")
  public async loginOrSignup(request, response): Promise<void> {
    const body: CreateLoginOrSignupRequest = request.body;
    if (!body?.email) {
      response.status(400).send({
        error: "Invalid request format",
      });
      return;
    }
    if (!EmailValidator.validate(body.email ?? "")) {
      response.status(400).send({
        error: "Invalid email format",
      });
      return;
    }
    const email: string = body.email;
    // LOG RESULT IN FUTURE
    await this.authenticationService.signupOrLoginByEmail(email, "cli");
    response.status(200).send({
      message: "ok",
    });
  }

  @Post("/api/session/exchange")
  public async exchangeSession(request, response): Promise<void> {
    return this.apolloRestClientFactory.runWithApolloClient(
      request.headers["session_key"],
      async (context, apolloClient) => {
        try {
          if (!context?.currentUser) {
            response.status(400).send({
              error: "failed to exchange session",
            });
            return;
          }
          const apolloResponse = await apolloClient.mutate({
            mutation: ExchangeSessionDocument,
          });
          response.status(200).send(apolloResponse?.data);
        } catch (e) {
          response.status(400).send({
            error: "failed to exchange session",
          });
        }
      }
    );
  }
}
