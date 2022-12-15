
import { inject, injectable } from "inversify";
import BaseController from "./BaseController";
import { Get, Post } from './annotations/HttpDecorators'
import AuthenticationService from "../services/authentication/AuthenticationService";
import EmailValidator from "email-validator";
import SessionStore, { Session } from "@floro/redis/src/sessions/SessionStore";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import PhotoResolverModule from "../resolvers/photo/PhotoResolverModule";
import { Photo } from "@floro/database/src/entities/Photo";
import MainConfig from "@floro/config/src/MainConfig";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import { Repository } from "@floro/database/src/entities/Repository";
import { Z_PARTIAL_FLUSH } from "zlib";

@injectable()
export default class RepoController extends BaseController {

    public authenticationService: AuthenticationService;
    public sessionStore: SessionStore;
    public contextFactory: ContextFactory;
    public mainConfig: MainConfig;
    public repoAccessor: RepoAccessor;

    constructor(
        @inject(AuthenticationService) authenticationService: AuthenticationService,
        @inject(SessionStore) sessionStore: SessionStore,
        @inject(ContextFactory) contextFactory: ContextFactory,
        @inject(MainConfig) mainConfig: MainConfig,
        @inject(RepoAccessor) repoAccessor: RepoAccessor 
    ) {
        super();
        this.authenticationService = authenticationService;
        this.sessionStore = sessionStore;
        this.contextFactory = contextFactory;
        this.mainConfig = mainConfig;
        this.repoAccessor = repoAccessor;
    }

    @Get("/api/repo/:repoId/clone")
    public async cloneRepo(request, response) {
        const repoId = request?.params?.repoId;
        if (!repoId) {
            response.sendStatus(404);
            return;
        }
        try {
            const repositoriesContext = await this.contextFactory.createContext(RepositoriesContext);
            const repo = await repositoriesContext.getById(repoId); 
            if (repo?.isPrivate) {
                // TODO, implement
                //return;
            }
            // check for gzip first
            response.writeHead(200, {
                'Content-Type': 'application/zip',
                'Content-disposition': `attachment; filename=${repo?.id}.tar.gz`
            });
            const gzip = await this.repoAccessor.getRepoZip(repo as Repository);
            gzip.pipe(response);
            return;
        } catch(e) {
            return;
        }
    }
}