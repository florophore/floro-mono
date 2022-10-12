import { inject, injectable } from "inversify";
import BaseController from "./BaseController";
import { Post } from './annotations/HttpDecorators'
import AuthenticationService from "../services/authentication/AuthenticationService";


export interface CreateLoginOrSignupRequest {
    email: string;
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
        console.log(request.body)
        // const email = {request.body.email}
        console.log("wtf")
        console.log(this);
        response.send({});
    }

}