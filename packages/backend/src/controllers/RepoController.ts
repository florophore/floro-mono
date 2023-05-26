
import { inject, injectable } from "inversify";
import BaseController from "./BaseController";
import { Get, Post } from './annotations/HttpDecorators'
import AuthenticationService from "../services/authentication/AuthenticationService";
import SessionStore from "@floro/redis/src/sessions/SessionStore";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import MainConfig from "@floro/config/src/MainConfig";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import { Repository } from "@floro/database/src/entities/Repository";
import { CommitData } from "floro/dist/src/sequenceoperations";

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

    @Post("/api/repo/:repoId/push/binary")
    public async pushBinary(request, response) {
        const repoId = request?.params?.repoId;
        if (!repoId) {
            response.sendStatus(404);
            return;
        }
        try {
            const repositoriesContext = await this.contextFactory.createContext(RepositoriesContext);
            const repo = await repositoriesContext.getById(repoId);
            return;
        } catch(e) {
            return;
        }
    }

    @Post("/api/repo/:repoId/push/commit")
    public async pushCommit(request, response) {
        const repoId = request?.params?.repoId;
        if (!repoId) {
            response.sendStatus(404);
            return;
        }
        try {
            const repositoriesContext = await this.contextFactory.createContext(RepositoriesContext);
            const repo = await repositoriesContext.getById(repoId);
            return;
        } catch(e) {
            return;
        }
    }

    @Post("/api/repo/:repoId/push/branch")
    public async pushBranch(request, response) {
        const repoId = request?.params?.repoId;
        if (!repoId) {
            response.sendStatus(404);
            return;
        }
        try {
            const repositoriesContext = await this.contextFactory.createContext(RepositoriesContext);
            const repo = await repositoriesContext.getById(repoId);
            return;
        } catch(e) {
            return;
        }
    }
}