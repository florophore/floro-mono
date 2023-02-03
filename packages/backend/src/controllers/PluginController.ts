import { inject, injectable } from "inversify";
import BaseController from "./BaseController";
import { Post } from './annotations/HttpDecorators'
import AuthenticationService from "../services/authentication/AuthenticationService";
import SessionStore from "@floro/redis/src/sessions/SessionStore";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import MainConfig from "@floro/config/src/MainConfig";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import { Repository } from "@floro/database/src/entities/Repository";
import fs from 'fs';
import tar from 'tar';
import { PluginUploadStream } from "../services/plugins/PluginUploadStream";
import { Stream } from "stream";
import PluginsContext from "@floro/database/src/contexts/plugins/PluginsContext";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";

@injectable()
export default class PluginController extends BaseController {

    public authenticationService: AuthenticationService;
    public sessionStore: SessionStore;
    private databaseConnection!: DatabaseConnection;
    public contextFactory: ContextFactory;
    public mainConfig: MainConfig;
    public repoAccessor: RepoAccessor;

    constructor(
        @inject(AuthenticationService) authenticationService: AuthenticationService,
        @inject(SessionStore) sessionStore: SessionStore,
        @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
        @inject(ContextFactory) contextFactory: ContextFactory,
        @inject(MainConfig) mainConfig: MainConfig,
        @inject(RepoAccessor) repoAccessor: RepoAccessor 
    ) {
        super();
        this.authenticationService = authenticationService;
        this.sessionStore = sessionStore;
        this.contextFactory = contextFactory;
        this.databaseConnection = databaseConnection;
        this.mainConfig = mainConfig;
        this.repoAccessor = repoAccessor;
    }

    @Post("/api/plugin/upload")
    public async uploadPlugin(request, response) {
        const pluginsContext = await this.contextFactory.createContext(PluginsContext); 
        const sessionKey = request.headers["session_key"];
        const session = await this.sessionStore.fetchSession(sessionKey);

        if (!session) {
          response.status(401).json({
            message: "Must be logged in.",
          });
        }

        if (request.busboy) {
            request.busboy.on('file', async (_name, file: Stream) => {
              const pluginStream = await PluginUploadStream.make(file).start();
              if (pluginStream.hasErrors) {
                response.status(400).json({
                  message: pluginStream.errorMessage
                });
                return;
              }
              const plugin = await pluginsContext.getByName(pluginStream.name);
              if (!plugin) {
                response.status(404).json({
                  message: `No plugin found. Please register ${pluginStream.name} from the floro UI before uploading.`
                });
                return;
              }
              if (plugin.ownerType == "user_plugin") {
                if (plugin.userId != session?.userId) {
                  response.status(403).json({
                    message: "Failed to upload. Unauthorized publisher.",
                  });
                  return;
                }

              }
              response.send({ok: true});
            });
            request.pipe(request.busboy);
        } else {
          response.status(400).json({
            message: "Malformed request.",
          });

        }
    }
}