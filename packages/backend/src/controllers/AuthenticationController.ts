import { inject, injectable } from "inversify";
import BaseController from "./BaseController";
import { Post } from './annotations/HttpDecorators'
import AuthenticationService from "../services/authentication/AuthenticationService";
import EmailValidator from "email-validator";


export interface CreateLoginOrSignupRequest {
    email?: string;
}

@injectable()
export default class AuthenticationController extends BaseController {

    public authenticationService: AuthenticationService;

    constructor(
        @inject(AuthenticationService) authenticationService: AuthenticationService
    ) {
        super();
        this.authenticationService = authenticationService;
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

}