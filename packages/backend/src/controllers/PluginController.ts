import { inject, injectable } from "inversify";
import BaseController from "./BaseController";
import { Post } from "./annotations/HttpDecorators";
import SessionStore from "@floro/redis/src/sessions/SessionStore";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import MainConfig from "@floro/config/src/MainConfig";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import { PluginUploadStream } from "../services/plugins/instances/PluginUploadStream";
import { Stream } from "stream";
import PluginsContext from "@floro/database/src/contexts/plugins/PluginsContext";
import PluginRegistryService, {
  UploadPluginReponse,
} from "../services/plugins/PluginRegistryService";
import OrganizationPermissionService from "../services/organizations/OrganizationPermissionService";
import OrganizationService from "../services/organizations/OrganizationService";
import UsersService from "../services/users/UsersService";
import { User } from "@floro/database/src/entities/User";
import { Organization } from "@floro/database/src/entities/Organization";

@injectable()
export default class PluginController extends BaseController {
  private pluginRegistryService: PluginRegistryService;
  private organizationService!: OrganizationService;
  private usersService!: UsersService;
  private organizationPermissionService!: OrganizationPermissionService;
  public sessionStore: SessionStore;
  public contextFactory: ContextFactory;
  public mainConfig: MainConfig;
  public repoAccessor: RepoAccessor;

  constructor(
    @inject(PluginRegistryService) pluginRegistryService: PluginRegistryService,
    @inject(UsersService) usersService: UsersService,
    @inject(OrganizationService) organizationService: OrganizationService,
    @inject(OrganizationPermissionService)
    organizationPermissionService: OrganizationPermissionService,
    @inject(SessionStore) sessionStore: SessionStore,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(MainConfig) mainConfig: MainConfig,
    @inject(RepoAccessor) repoAccessor: RepoAccessor
  ) {
    super();
    this.pluginRegistryService = pluginRegistryService;
    this.organizationService = organizationService;
    this.usersService = usersService;
    this.organizationPermissionService = organizationPermissionService;
    this.sessionStore = sessionStore;
    this.contextFactory = contextFactory;
    this.mainConfig = mainConfig;
    this.repoAccessor = repoAccessor;
  }

  @Post("/api/plugin/upload")
  public async uploadPlugin(request, response) {
    const pluginsContext = await this.contextFactory.createContext(
      PluginsContext
    );
    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session) {
      response.status(401).json({
        message: "Must be logged in.",
      });
    }

    if (request.busboy) {
      request.busboy.on("file", async (_name, file: Stream) => {
        const pluginStream = await PluginUploadStream.make(file).start();
        if (pluginStream.hasErrors) {
          request.unpipe(response.busboy);
          response.status(400).json({
            message: pluginStream.errorMessage,
          });
          return;
        }
        const plugin = await pluginsContext.getByName(pluginStream.name);
        if (!plugin) {
          request.unpipe(response.busboy);
          response.status(404).json({
            message: `No plugin found. Please register ${pluginStream.name} from the floro UI before uploading.`,
          });
          return;
        }
        if (plugin.ownerType == "user_plugin") {
          if (plugin.userId != session?.userId) {
            request.unpipe(response.busboy);
            response.status(403).json({
              message: "Failed to upload. Unauthorized publisher.",
            });
            return;
          }
        }
        const user = await this.usersService.getUser(session?.userId as string);
        if (!user) {
          request.unpipe(response.busboy);
          response.status(403).json({
            message: "Failed to upload. Unauthorized publisher.",
          });
          return;
        }
        let uploadResponse!: UploadPluginReponse;
        if (plugin.ownerType == "org_plugin") {
          const organization = await this.organizationService.fetchOrganization(
            plugin.organizationId
          );
          const organizationMember =
            await this.organizationPermissionService.getUserMembership(
              organization as Organization,
              user as User
            );
          if (
            !organizationMember ||
            organizationMember.membershipState != "active"
          ) {
            request.unpipe(response.busboy);
            response.status(403).json({
              message: "Failed to upload. Unauthorized publisher.",
            });
            return;
          }
          const permissions =
            await this.organizationPermissionService.calculateMemberOrgPermissions(
              organizationMember
            );
          if (!permissions.canUploadPlugins) {
            request.unpipe(response.busboy);
            response.status(403).json({
              message: "Failed to upload. Unauthorized publisher.",
            });
            return;
          }
          uploadResponse = await this.pluginRegistryService.writePluginVersion(
            plugin,
            pluginStream,
            user,
            organization as Organization
          );
        } else {
          uploadResponse = await this.pluginRegistryService.writePluginVersion(
            plugin,
            pluginStream,
            user
          );
        }
        if (uploadResponse.action == "PLUGIN_VERSION_CREATED") {
          request.unpipe(response.busboy);
          response.status(200).json({
            message: `Successfully uploaded ${pluginStream.version}`,
          });
          return;
        }
        if (uploadResponse.action == "LOG_ERROR") {
          request.unpipe(response.busboy);
          response.status(400).json({
            message: "Failed to upload. Unknown server error.",
          });
          return;
        }
        request.unpipe(response.busboy);
        response.status(400).json({
          message:
            uploadResponse.error?.message ??
            "Failed to upload. Unknown server error.",
        });
      });
      request.pipe(request.busboy);
    } else {
      response.status(400).json({
        message: "Malformed request.",
      });
    }
  }
}
