import { injectable, inject } from "inversify";
import BaseController from "../BaseController";
import { Get } from "../annotations/HttpDecorators";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RepoDataService from "../../services/repositories/RepoDataService";
import SessionStore, { Session } from "@floro/redis/src/sessions/SessionStore";
import RepoRBACService from "../../services/repositories/RepoRBACService";
import ApiKeysContext from "@floro/database/src/contexts/api_keys/ApiKeysContext";
import RepositoryEnabledApiKeysContext from "@floro/database/src/contexts/api_keys/RepositoryEnabledApiKeysContext";
import BranchesContext from "@floro/database/src/contexts/repositories/BranchesContext";
import CommitsContext from "@floro/database/src/contexts/repositories/CommitsContext";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import BinaryAccessor from "@floro/storage/src/accessors/BinaryAccessor";
import MainConfig from "@floro/config/src/MainConfig";
import StorageAuthenticator from "@floro/storage/src/StorageAuthenticator";
import BinaryCommitUtilizationsContext from "@floro/database/src/contexts/repositories/BinaryCommitUtilizationsContext";
import PluginCommitUtilizationsContext from "@floro/database/src/contexts/repositories/PluginCommitUtilizationsContext";
import PluginsVersionsContext from "@floro/database/src/contexts/plugins/PluginVersionsContext";
import { ApiKey } from "@floro/database/src/entities/ApiKey";
import { PluginVersion } from "@floro/database/src/entities/PluginVersion";
import UsersService from "../../services/users/UsersService";
import OrganizationService from "../../services/organizations/OrganizationService";
import OrganizationPermissionService from "../../services/organizations/OrganizationPermissionService";
import { Organization } from "@floro/database/src/entities/Organization";
import { User } from "@floro/database/src/entities/User";

@injectable()
export default class SyncController extends BaseController {
  public contextFactory: ContextFactory;
  public repoDataService!: RepoDataService;
  public sessionStore: SessionStore;
  public repoRBAC: RepoRBACService;
  public mainConfig: MainConfig;
  public repoAccessor: RepoAccessor;
  public binaryAccessor: BinaryAccessor;
  public storageAuthenticator!: StorageAuthenticator;
  private organizationService!: OrganizationService;
  private usersService!: UsersService;
  private organizationPermissionService!: OrganizationPermissionService;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoDataService) repoDataService: RepoDataService,
    @inject(SessionStore) sessionStore: SessionStore,
    @inject(RepoRBACService) repoRBAC: RepoRBACService,
    @inject(MainConfig) mainConfig: MainConfig,
    @inject(RepoAccessor) repoAccessor: RepoAccessor,
    @inject(BinaryAccessor) binaryAccessor: BinaryAccessor,
    @inject(StorageAuthenticator) storageAuthenticator: StorageAuthenticator,
    @inject(UsersService) usersService: UsersService,
    @inject(OrganizationService) organizationService: OrganizationService,
    @inject(OrganizationPermissionService)
    organizationPermissionService: OrganizationPermissionService
  ) {
    super();
    this.contextFactory = contextFactory;
    this.repoDataService = repoDataService;
    this.sessionStore = sessionStore;
    this.repoRBAC = repoRBAC;
    this.mainConfig = mainConfig;
    this.repoAccessor = repoAccessor;
    this.binaryAccessor = binaryAccessor;
    this.storageAuthenticator = storageAuthenticator;
    this.organizationService = organizationService;
    this.usersService = usersService;
    this.organizationPermissionService = organizationPermissionService;
  }

  @Get("/sync/api/v0/repo/:ownerHandle/:repoName")
  public async getRepo_DEPRECATED(request, response): Promise<void> {
    return await this.getRepo(request, response);
  }

  @Get("/sync/api/v0/repository/:ownerHandle/:repoName")
  public async getRepo(request, response): Promise<void> {
    try {
      const ownerHandle = request?.params?.ownerHandle;
      const repoName = request?.params?.repoName;

      let session: Session | null = null;
      let apiKey: ApiKey | null = null;
      const apiKeySecret = request?.headers?.["floro-api-key"];
      const sessionKey = request.headers["session_key"];
      if (!apiKeySecret && !sessionKey) {
        response.sendStatus(403);
        return;
      }
      if (sessionKey) {
        session = await this.sessionStore.fetchSession(sessionKey);
        if (!session?.user && !apiKeySecret) {
          response.sendStatus(403);
          return;
        }
        const apiKeysContext = await this.contextFactory.createContext(
          ApiKeysContext
        );
        apiKey = await apiKeysContext.getBySecret(apiKeySecret);
      } else {
        const apiKeysContext = await this.contextFactory.createContext(
          ApiKeysContext
        );
        apiKey = await apiKeysContext.getBySecret(apiKeySecret);
      }

      const repo = await this.repoDataService.fetchRepoByName(
        ownerHandle ?? "",
        repoName ?? ""
      );
      if (!repo) {
        response.sendStatus(404);
        return;
      }

      const branchesContext = await this.contextFactory.createContext(
        BranchesContext
      );
      const dbBranches = await branchesContext.getAllByRepoId(repo.id);
      const branches = dbBranches?.map((b) => {
        return {
          id: b.branchId as string,
          name: b.name as string,
          lastCommit: b.lastCommit as string,
          createdBy: b.createdById as string,
          createdByUsername: b.createdByUsername as string,
          createdAt: b.createdAt as string,
          baseBranchId: b?.baseBranchId as string,
        };
      });

      if (!repo.isPrivate) {
        const info = {
          id: repo.id,
          name: repo.name,
          repoType: repo.repoType,
          userId: repo.userId,
          organizationId: repo.organizationId,
          isPrivate: repo.isPrivate,
          ownerHandle:
            repo?.repoType == "user_repo"
              ? repo.user?.username
              : repo.organization?.handle,
          branches,
        };
        response.send(info);
        return;
      }

      if (session) {
        if (!session?.user) {
          response.sendStatus(403);
          return;
        }
        const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
          repo,
          session.user
        );
        if (!canPull && !apiKeySecret) {
          response.sendStatus(403);
          return;
        }
        const info = {
          id: repo.id,
          name: repo.name,
          repoType: repo.repoType,
          userId: repo.userId,
          organizationId: repo.organizationId,
          isPrivate: repo.isPrivate,
          ownerHandle:
            repo?.repoType == "user_repo"
              ? repo.user?.username
              : repo.organization?.handle,
          branches,
        };
        response.send(info);
        return;
      }
      if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
        response.status(403).json({
          message: "forbidden",
        });
        return;
      }

      const repositoryEnabledApiKeysContext =
        await this.contextFactory.createContext(
          RepositoryEnabledApiKeysContext
        );
      const enabledApiKey =
        await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
          repo.id,
          apiKey.id
        );
      if (!enabledApiKey) {
        response.status(403).json({
          message: "forbidden",
        });
        return;
      }
      const info = {
        id: repo.id,
        name: repo.name,
        repoType: repo.repoType,
        userId: repo.userId,
        organizationId: repo.organizationId,
        isPrivate: repo.isPrivate,
        ownerHandle:
          repo?.repoType == "user_repo"
            ? repo.user?.username
            : repo.organization?.handle,
        branches,
      };
      response.send(info);
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Get("/sync/api/v0/repository/:repositoryId/commit/:sha")
  public async getCommit(request, response): Promise<void> {
    try {
      const repoId = request?.params?.repositoryId;
      const sha = request?.params?.sha;

      let session: Session | null = null;
      let apiKey: ApiKey | null = null;
      const apiKeySecret = request?.headers?.["floro-api-key"];
      const sessionKey = request.headers["session_key"];
      if (!apiKeySecret && !sessionKey) {
        response.sendStatus(403);
        return;
      }
      if (sessionKey) {
        session = await this.sessionStore.fetchSession(sessionKey);
        if (!session?.user && !apiKeySecret) {
          response.sendStatus(403);
          return;
        }
        const apiKeysContext = await this.contextFactory.createContext(
          ApiKeysContext
        );
        apiKey = await apiKeysContext.getBySecret(apiKeySecret);
      } else {
        const apiKeysContext = await this.contextFactory.createContext(
          ApiKeysContext
        );
        apiKey = await apiKeysContext.getBySecret(apiKeySecret);
      }

      if (!repoId || !sha) {
        response.sendStatus(404);
        return;
      }

      const repo = await this.repoDataService.getRepository(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }

      const commitsContext = await this.contextFactory.createContext(
        CommitsContext
      );
      const hasCommit = await commitsContext.repoHasCommit(repoId, sha);

      if (!hasCommit) {
        response.sendStatus(404);
        return;
      }

      const commit = await commitsContext.getCommitBySha(repo.id, sha);
      const safeCommit = {
        sha: commit?.sha,
        originalSha: commit?.originalSha,
        parent: commit?.parent ?? null,
        historicalParent: commit?.historicalParent ?? null,
        idx: commit?.idx as number,
        mergeBase: commit?.mergeBase,
        mergeRevertSha: commit?.mergeRevertSha,
        revertFromSha: commit?.revertFromSha,
        revertToSha: commit?.revertToSha,
        message: commit?.message as string,
        username: commit?.username as string,
        authorUsername: commit?.authorUsername,
        timestamp: commit?.timestamp,
        authorUserId: commit?.authorUserId,
        userId: commit?.userId as string,
      };

      if (!repo.isPrivate) {
        response.send(safeCommit);
        return;
      }

      if (session) {
        const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
          repo,
          session.user
        );
        if (!canPull && !apiKeySecret) {
          response.sendStatus(403);
          return;
        }
        response.send(safeCommit);
        return;
      }

      if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
        response.status(403).json({
          message: "forbidden",
        });
        return;
      }

      const repositoryEnabledApiKeysContext =
        await this.contextFactory.createContext(
          RepositoryEnabledApiKeysContext
        );
      const enabledApiKey =
        await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
          repo.id,
          apiKey.id
        );
      if (!enabledApiKey) {
        response.status(403).json({
          message: "forbidden",
        });
        return;
      }
      response.send(safeCommit);
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Get("/sync/api/v0/repository/:repositoryId/commit/:sha/stateLink")
  public async getStateLink(request, response): Promise<void> {
    try {
      const repoId = request?.params?.repositoryId;
      const sha = request?.params?.sha;

      let session: Session | null = null;
      let apiKey: ApiKey | null = null;
      const apiKeySecret = request?.headers?.["floro-api-key"];
      const sessionKey = request.headers["session_key"];
      if (!apiKeySecret && !sessionKey) {
        response.sendStatus(403);
        return;
      }
      if (sessionKey) {
        session = await this.sessionStore.fetchSession(sessionKey);
        if (!session?.user && !apiKeySecret) {
          response.sendStatus(403);
          return;
        }
        const apiKeysContext = await this.contextFactory.createContext(
          ApiKeysContext
        );
        apiKey = await apiKeysContext.getBySecret(apiKeySecret);
      } else {
        const apiKeysContext = await this.contextFactory.createContext(
          ApiKeysContext
        );
        apiKey = await apiKeysContext.getBySecret(apiKeySecret);
      }

      if (!repoId || !sha) {
        response.sendStatus(404);
        return;
      }

      const repo = await this.repoDataService.getRepository(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }

      const commitsContext = await this.contextFactory.createContext(
        CommitsContext
      );
      const hasCommit = await commitsContext.repoHasCommit(repoId, sha);

      if (!hasCommit) {
        response.sendStatus(404);
        return;
      }

      const urlPath =
        "/" + this.repoAccessor.getRelativeCommitStatePath(repo, sha);
      const privateCdnUrl = this.mainConfig.privateRoot();
      const url = privateCdnUrl + urlPath;
      const stateLink = this.storageAuthenticator.signURL(url, urlPath, 3600);

      if (!repo.isPrivate) {
        response.send({
          stateLink,
        });
        return;
      }

      if (session) {
        const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
          repo,
          session.user
        );
        if (!canPull && !apiKeySecret) {
          response.sendStatus(403);
          return;
        }
        response.send({
          stateLink,
        });
        return;
      }

      if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
        response.status(403).json({
          message: "forbidden",
        });
        return;
      }

      const repositoryEnabledApiKeysContext =
        await this.contextFactory.createContext(
          RepositoryEnabledApiKeysContext
        );
      const enabledApiKey =
        await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
          repo.id,
          apiKey.id
        );
      if (!enabledApiKey) {
        response.status(403).json({
          message: "forbidden",
        });
        return;
      }
      response.send({
        stateLink,
      });
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Get("/sync/api/v0/repository/:repositoryId/commit/:sha/binaries")
  public async getBinaries(request, response): Promise<void> {
    try {
      const repoId = request?.params?.repositoryId;
      const sha = request?.params?.sha;

      if (!repoId || !sha) {
        response.sendStatus(404);
        return;
      }

      let session: Session | null = null;
      let apiKey: ApiKey | null = null;
      const apiKeySecret = request?.headers?.["floro-api-key"];
      const sessionKey = request.headers["session_key"];
      if (!apiKeySecret && !sessionKey) {
        response.sendStatus(403);
        return;
      }
      if (sessionKey) {
        session = await this.sessionStore.fetchSession(sessionKey);
        if (!session?.user && !apiKeySecret) {
          response.sendStatus(403);
          return;
        }
        const apiKeysContext = await this.contextFactory.createContext(
          ApiKeysContext
        );
        apiKey = await apiKeysContext.getBySecret(apiKeySecret);
      } else {
        const apiKeysContext = await this.contextFactory.createContext(
          ApiKeysContext
        );
        apiKey = await apiKeysContext.getBySecret(apiKeySecret);
      }

      const repo = await this.repoDataService.getRepository(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }

      const commitsContext = await this.contextFactory.createContext(
        CommitsContext
      );
      const hasCommit = await commitsContext.repoHasCommit(repoId, sha);

      if (!hasCommit) {
        response.sendStatus(404);
        return;
      }

      if (!repo.isPrivate) {
        const binaryCommitUtilizationsContext =
          await this.contextFactory.createContext(
            BinaryCommitUtilizationsContext
          );
        const binaryUtilizations =
          await binaryCommitUtilizationsContext.getAllByRepoAndSha(
            repo.id,
            sha
          );
        const privateCdnUrl = this.mainConfig.privateRoot();
        const binaries = binaryUtilizations.map((bu) => {
          const urlPath =
            "/" + this.binaryAccessor.getRelativeBinaryPath(bu.binaryFileName);
          const url = privateCdnUrl + urlPath;
          return {
            hash: bu.binaryHash,
            fileName: bu.binaryFileName,
            url: this.storageAuthenticator.signURL(url, urlPath, 3600),
          };
        });
        response.send({
          binaries,
        });
        return;
      }

      if (!apiKeySecret && !sessionKey) {
        response.sendStatus(403);
        return;
      }
      if (session) {
        if (!session?.user) {
          response.sendStatus(403);
          return;
        }
        const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
          repo,
          session.user
        );
        if (!canPull && !apiKeySecret) {
          response.sendStatus(403);
          return;
        }

        const binaryCommitUtilizationsContext =
          await this.contextFactory.createContext(
            BinaryCommitUtilizationsContext
          );
        const binaryUtilizations =
          await binaryCommitUtilizationsContext.getAllByRepoAndSha(
            repo.id,
            sha
          );
        const privateCdnUrl = this.mainConfig.privateRoot();
        const binaries = binaryUtilizations.map((bu) => {
          const urlPath =
            "/" + this.binaryAccessor.getRelativeBinaryPath(bu.binaryFileName);
          const url = privateCdnUrl + urlPath;
          return {
            hash: bu.binaryHash,
            fileName: bu.binaryFileName,
            url: this.storageAuthenticator.signURL(url, urlPath, 3600),
          };
        });
        response.send({
          binaries,
        });
        return;
      }

      if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
        response.status(403).json({
          message: "forbidden",
        });
        return;
      }

      const repositoryEnabledApiKeysContext =
        await this.contextFactory.createContext(
          RepositoryEnabledApiKeysContext
        );
      const enabledApiKey =
        await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
          repo.id,
          apiKey.id
        );
      if (!enabledApiKey) {
        response.status(403).json({
          message: "forbidden",
        });
        return;
      }
      const binaryCommitUtilizationsContext =
        await this.contextFactory.createContext(
          BinaryCommitUtilizationsContext
        );
      const binaryUtilizations =
        await binaryCommitUtilizationsContext.getAllByRepoAndSha(repo.id, sha);
      const privateCdnUrl = this.mainConfig.privateRoot();
      const binaries = binaryUtilizations.map((bu) => {
        const urlPath =
          "/" + this.binaryAccessor.getRelativeBinaryPath(bu.binaryFileName);
        const url = privateCdnUrl + urlPath;
        return {
          hash: bu.binaryHash,
          fileName: bu.binaryFileName,
          url: this.storageAuthenticator.signURL(url, urlPath, 3600),
        };
      });
      response.send({
        binaries,
      });
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Get("/sync/api/v0/repository/:repositoryId/commit/:sha/manifests")
  public async getManifests(request, response): Promise<void> {
    try {
      const repoId = request?.params?.repositoryId;
      const sha = request?.params?.sha;

      let session: Session | null = null;
      let apiKey: ApiKey | null = null;
      const apiKeySecret = request?.headers?.["floro-api-key"];
      const sessionKey = request.headers["session_key"];
      if (!apiKeySecret && !sessionKey) {
        response.sendStatus(403);
        return;
      }
      if (sessionKey) {
        session = await this.sessionStore.fetchSession(sessionKey);
        if (!session?.user && !apiKeySecret) {
          response.sendStatus(403);
          return;
        }
        const apiKeysContext = await this.contextFactory.createContext(
          ApiKeysContext
        );
        apiKey = await apiKeysContext.getBySecret(apiKeySecret);
      } else {
        const apiKeysContext = await this.contextFactory.createContext(
          ApiKeysContext
        );
        apiKey = await apiKeysContext.getBySecret(apiKeySecret);
      }

      if (!repoId || !sha) {
        response.sendStatus(404);
        return;
      }

      const repo = await this.repoDataService.getRepository(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }

      const commitsContext = await this.contextFactory.createContext(
        CommitsContext
      );
      const hasCommit = await commitsContext.repoHasCommit(repoId, sha);

      if (!hasCommit) {
        response.sendStatus(404);
        return;
      }

      if (!repo.isPrivate) {
        const pluginCommitUtilizationsContext =
          await this.contextFactory.createContext(
            PluginCommitUtilizationsContext
          );
        const pluginUtilizations =
          await pluginCommitUtilizationsContext.getAllByRepoAndSha(
            repo.id,
            sha
          );
        const pluginVersionIds = pluginUtilizations?.map(
          (pu) => pu.pluginVersionId
        );
        const pluginsVersionsContext = await this.contextFactory.createContext(
          PluginsVersionsContext
        );
        const pluginVersions = await pluginsVersionsContext.getByIds(
          pluginVersionIds
        );
        const manifests = pluginVersions.map((pv) => {
          return JSON.parse(pv.manifest);
        });
        response.send({
          manifests,
        });
        return;
      }

      if (!apiKeySecret && !sessionKey) {
        response.sendStatus(403);
        return;
      }
      if (session) {
        if (!session?.user) {
          response.sendStatus(403);
          return;
        }
        const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
          repo,
          session.user
        );
        if (!canPull && !apiKeySecret) {
          response.sendStatus(403);
          return;
        }

        const pluginCommitUtilizationsContext =
          await this.contextFactory.createContext(
            PluginCommitUtilizationsContext
          );
        const pluginUtilizations =
          await pluginCommitUtilizationsContext.getAllByRepoAndSha(
            repo.id,
            sha
          );
        const pluginVersionIds = pluginUtilizations?.map(
          (pu) => pu.pluginVersionId
        );
        const pluginsVersionsContext = await this.contextFactory.createContext(
          PluginsVersionsContext
        );
        const pluginVersions = await pluginsVersionsContext.getByIds(
          pluginVersionIds
        );
        const manifests = pluginVersions.map((pv) => {
          return JSON.parse(pv.manifest);
        });
        response.send({
          manifests,
        });
        return;
      }

      if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
        response.status(403).json({
          message: "forbidden",
        });
        return;
      }

      const repositoryEnabledApiKeysContext =
        await this.contextFactory.createContext(
          RepositoryEnabledApiKeysContext
        );
      const enabledApiKey =
        await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
          repo.id,
          apiKey.id
        );
      if (!enabledApiKey) {
        response.status(403).json({
          message: "forbidden",
        });
        return;
      }
      const pluginCommitUtilizationsContext =
        await this.contextFactory.createContext(
          PluginCommitUtilizationsContext
        );
      const pluginUtilizations =
        await pluginCommitUtilizationsContext.getAllByRepoAndSha(repo.id, sha);
      const pluginVersionIds = pluginUtilizations?.map(
        (pu) => pu.pluginVersionId
      );
      const pluginsVersionsContext = await this.contextFactory.createContext(
        PluginsVersionsContext
      );
      const pluginVersions = await pluginsVersionsContext.getByIds(
        pluginVersionIds
      );
      const manifests = pluginVersions.map((pv) => {
        return JSON.parse(pv.manifest);
      });
      response.send({
        manifests,
      });
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Get("/sync/api/v0/plugin/:name/:version/manifest")
  public async getManifest(request, response): Promise<void> {
    const pluginApiCheck = await this.runPluginAccessChecksForApiKey(request);
    if (pluginApiCheck.statusCode == 200 && pluginApiCheck.pluginVersion) {
      response
        .status(200)
        .json(JSON.parse(pluginApiCheck.pluginVersion.manifest));
      return;
    }
    const sessionKey = request.headers["session_key"];
    if (sessionKey) {
      const pluginSessionCheck = await this.runPluginAccessChecksForSession(
        request
      );
      if (
        pluginSessionCheck?.statusCode == 200 &&
        pluginSessionCheck.pluginVersion
      ) {
        response
          .status(200)
          .json(JSON.parse(pluginSessionCheck.pluginVersion.manifest));
        return;
      }
      if (pluginSessionCheck.statusCode == 404) {
        response.sendStatus(404);
        return;
      }
      if (pluginSessionCheck.statusCode == 403) {
        response.sendStatus(403);
        return;
      }
      response.sendStatus(400);
      return;
    }

    if (pluginApiCheck.statusCode == 404) {
      response.sendStatus(404);
      return;
    }
    if (pluginApiCheck.statusCode == 403) {
      response.sendStatus(403);
      return;
    }
    response.sendStatus(400);
  }

  private async runPluginAccessChecksForSession(request): Promise<{
    statusCode: number;
    status: "error" | "ok";
    pluginVersion?: PluginVersion | null;
  }> {
    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session) {
      return {
        status: "error",
        statusCode: 403,
      };
    }

    const user = await this.usersService.getUser(session?.userId as string);
    if (!user) {
      return {
        status: "error",
        statusCode: 403,
      };
    }

    const pluginVersionsContext = await this.contextFactory.createContext(
      PluginsVersionsContext
    );

    const pluginVersion = await pluginVersionsContext.getByNameAndVersion(
      request?.params["name"] ?? "",
      request?.params["version"] ?? ""
    );

    if (!pluginVersion) {
      return {
        status: "error",
        statusCode: 404,
      };
    }

    if (pluginVersion.ownerType == "user_plugin" && pluginVersion.isPrivate) {
      if (user.id != pluginVersion.userId) {
        return {
          status: "error",
          statusCode: 403,
        };
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
        return {
          status: "error",
          statusCode: 403,
        };
      }
    }

    if (pluginVersion.state == "cancelled") {
      return {
        status: "error",
        statusCode: 400,
      };
    }

    return {
      status: "ok",
      statusCode: 200,
      pluginVersion: pluginVersion ?? null,
    };
  }

  private async runPluginAccessChecksForApiKey(request): Promise<{
    statusCode: number;
    status: "error" | "ok";
    pluginVersion?: PluginVersion | null;
  }> {
    const apiKeySecret = request?.headers?.["floro-api-key"];
    if (!apiKeySecret) {
      return {
        status: "error",
        statusCode: 403,
      };
    }

    const apiKeysContext = await this.contextFactory.createContext(
      ApiKeysContext
    );
    const apiKey = await apiKeysContext.getBySecret(apiKeySecret);
    if (!apiKey) {
      return {
        status: "error",
        statusCode: 403,
      };
    }
    const pluginVersionsContext = await this.contextFactory.createContext(
      PluginsVersionsContext
    );

    const pluginVersion = await pluginVersionsContext.getByNameAndVersion(
      request?.params["name"] ?? "",
      request?.params["version"] ?? ""
    );
    if (!pluginVersion) {
      return {
        status: "error",
        statusCode: 404,
      };
    }

    if (pluginVersion.ownerType == "user_plugin" && pluginVersion.isPrivate) {
      if (
        apiKey.keyType != "user_key" ||
        apiKey.userId != pluginVersion.userId
      ) {
        return {
          status: "error",
          statusCode: 403,
        };
      }
    }

    if (pluginVersion.ownerType == "org_plugin" && pluginVersion.isPrivate) {
      if (
        apiKey.keyType != "org_key" ||
        apiKey.organizationId != pluginVersion.organizationId
      ) {
        return {
          status: "error",
          statusCode: 403,
        };
      }
    }

    if (pluginVersion.state == "cancelled") {
      return {
        status: "error",
        statusCode: 400,
      };
    }

    return {
      status: "ok",
      statusCode: 200,
      pluginVersion: pluginVersion ?? null,
    };
  }
}
