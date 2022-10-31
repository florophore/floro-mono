import { inject, injectable } from "inversify";
import BaseController from "./BaseController";
import { Post } from './annotations/HttpDecorators'
import AuthenticationService from "../services/authentication/AuthenticationService";
import EmailValidator from "email-validator";
import SessionStore, { Session } from "@floro/redis/src/sessions/SessionStore";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";


export interface CreateLoginOrSignupRequest {
    email?: string;
}

@injectable()
export default class AuthenticationController extends BaseController {

    public authenticationService: AuthenticationService;
    public sessionStore: SessionStore;
    public contextFactory: ContextFactory;

    constructor(
        @inject(AuthenticationService) authenticationService: AuthenticationService,
        @inject(SessionStore) sessionStore: SessionStore,
        @inject(ContextFactory) contextFactory: ContextFactory
    ) {
        super();
        this.authenticationService = authenticationService;
        this.sessionStore = sessionStore;
        this.contextFactory = contextFactory;
    }

    @Post('/api/authenticate')
    public async loginOrSignup(request, response): Promise<void> {
        const body: CreateLoginOrSignupRequest = request.body;
        if (!body?.email) {
            response.status(400).send({
                error: "Invalid request format" 
            });
            return;
        }
        if (!EmailValidator.validate(body.email ?? "")) {
            response.status(400).send({
                error: "Invalid email format" 
            });
            return;
        }
        const email: string = body.email;
        // LOG RESULT IN FUTURE
        await this.authenticationService.signupOrLoginByEmail(email, 'cli');
        response.status(200).send({
            message: "ok" 
        });
    }

    @Post('/api/session/exchange')
    public async exchangeSession(request, response): Promise<void> {
        const userSessionKey = request.headers['session_key'];
        if (!userSessionKey) {
            response.status(400).send({
                error: "no session present"
            });
        }
        try {
            const currentSession = await this.sessionStore.fetchSession(userSessionKey);
            const usersContext = await this.contextFactory.createContext(UsersContext);
            if (!currentSession?.userId) {
                response.status(400).send({
                    error: "failed to exchange session"
                });
                return;
            }
            const user = await usersContext.getById(currentSession?.userId as string);
            if (!user) {
                response.status(400).send({
                    error: "failed to exchange session"
                });
                return;
            }
            const exchangeSession = await this.sessionStore.exchangeSession(currentSession as Session);
            const session = await this.sessionStore.updateSessionUser(exchangeSession, user);
            response.status(200).send({
                user,
                session
            });

        } catch (e) {
            response.status(400).send({
                error: "failed to exchange session"
            });
        }
    }
}