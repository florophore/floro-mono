import { inject, injectable } from "inversify";
import BaseController from "./BaseController";
import { Post, Get } from "./annotations/HttpDecorators";
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
import { PluginVersion } from "@floro/database/src/entities/PluginVersion";
import PluginsVersionsContext from "@floro/database/src/contexts/plugins/PluginVersionsContext";
import StorageAuthenticator from "@floro/storage/src/StorageAuthenticator";
import PluginVersionDependenciesContext from "@floro/database/src/contexts/plugins/PluginVersionDependenciesContext";

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
  public storageAuthenticator!: StorageAuthenticator;

  constructor(
    @inject(PluginRegistryService) pluginRegistryService: PluginRegistryService,
    @inject(UsersService) usersService: UsersService,
    @inject(OrganizationService) organizationService: OrganizationService,
    @inject(OrganizationPermissionService)
    organizationPermissionService: OrganizationPermissionService,
    @inject(SessionStore) sessionStore: SessionStore,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(MainConfig) mainConfig: MainConfig,
    @inject(RepoAccessor) repoAccessor: RepoAccessor,
    @inject(StorageAuthenticator) storageAuthenticator: StorageAuthenticator,
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
    this.storageAuthenticator = storageAuthenticator;
  }

  private async runPluginVersionAccessChecks(request, response): Promise<PluginVersion|null> {
    const pluginVersionsContext = await this.contextFactory.createContext(
      PluginsVersionsContext
    );
    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session) {
      response.status(403).json({
        message: "Forbidden.",
      });
      return null;
    }

    const user = await this.usersService.getUser(session?.userId as string);
    if (!user) {
      response.status(403).json({
        message: "Forbidden.",
      });
      return null;
    }

    const pluginVersion = await pluginVersionsContext.getByNameAndVersion(
      request?.params["name"] ?? "",
      request?.params["version"] ?? ""
    );
    if (!pluginVersion) {
      response.status(404).json({
        message: "Not found.",
      });
      return null;
    }

    if (pluginVersion.ownerType == "user_plugin" && pluginVersion.isPrivate) {
      if (user.id != pluginVersion.userId) {
        response.status(403).json({
          message: "Forbidden.",
        });
        return null;
      }
    }

    if (pluginVersion.ownerType == "org_plugin" && pluginVersion.isPrivate) {
      const organization = await this.organizationService.fetchOrganization(
        pluginVersion.organizationId
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
        response.status(403).json({
          message: "Forbidden.",
        });
        return null;
      }
    }

    if (pluginVersion.state == "cancelled") {
        response.status(404).json({
          message: "Not Found.",
        });
        return null;
    }
    return pluginVersion;
  }

  @Get("/plugins/:name/:version")
  public async getIndexHTML(request, response) {
    const pluginVersion = await this.runPluginVersionAccessChecks(request, response);
    if (!pluginVersion) {
      return;
    }
    response
      .status(200)
      .setHeader("Content-Type", "text/html")
      .send(pluginVersion.indexHtml);
  }

  @Get("/api/plugin/:name/:version/manifest")
  public async getManifest(request, response) {
    const pluginVersion = await this.runPluginVersionAccessChecks(request, response);
    if (!pluginVersion) {
      return;
    }
    response.status(200).json(pluginVersion.manifest);
  }
  
  @Get("/api/plugin/:name/:version/install")
  public async getTar(request, response) {
    const pluginVersion = await this.runPluginVersionAccessChecks(request, response);
    if (!pluginVersion) {
      return;
    }
    const pluginDependenciesVersion = await this.contextFactory.createContext(PluginVersionDependenciesContext);
    const dependenciesVersions = await pluginDependenciesVersion.getDependenciesByUploadHash(pluginVersion.uploadHash);

    const privateCdnUrl = this.mainConfig.privateRoot();
    const expiration = new Date().getTime() + (3600*1000);
    const dependencies = dependenciesVersions.map((dependencyVersion) => {
        const pluginVersion = dependencyVersion.dependencyPluginVersion;
        const urlPath = `/plugin-tars/${pluginVersion?.uploadHash}.tar.gz`;
        const url = privateCdnUrl + urlPath;
        const signedUrl = this.storageAuthenticator.signURL(url, urlPath, 3600);
        return {
          name: pluginVersion?.name,
          version: pluginVersion?.version,
          link: signedUrl,
          expiration
        }
    });
    const urlPath = `/plugin-tars/${pluginVersion.uploadHash}.tar.gz`;
    const url = privateCdnUrl + urlPath;
    const signedUrl = this.storageAuthenticator.signURL(url, urlPath, 3600);
    response.status(200).json({
        name: pluginVersion?.name,
        version: pluginVersion?.version,
        link: signedUrl,
        expiration,
        dependencies
    });
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
