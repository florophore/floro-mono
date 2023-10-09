import { inject, injectable } from "inversify";
import { Get } from "../annotations/HttpDecorators";
import BaseController from "../BaseController";
import SessionStore from "@floro/redis/src/sessions/SessionStore";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import MainConfig from "@floro/config/src/MainConfig";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import StorageAuthenticator from "@floro/storage/src/StorageAuthenticator";
import BinaryAccessor from "@floro/storage/src/accessors/BinaryAccessor";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ApiKeysContext from "@floro/database/src/contexts/api_keys/ApiKeysContext";
import { randomUUID, createHash } from "crypto";
import RepositoryEnabledApiKeysContext from "@floro/database/src/contexts/api_keys/RepositoryEnabledApiKeysContext";
import ApiEventsContext from "@floro/database/src/contexts/api_keys/ApiEventsContext";
import { Repository } from "@floro/database/src/entities/Repository";
import BranchesContext from "@floro/database/src/contexts/repositories/BranchesContext";
import CommitsContext from "@floro/database/src/contexts/repositories/CommitsContext";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import BinaryCommitUtilizationsContext from "@floro/database/src/contexts/repositories/BinaryCommitUtilizationsContext";
import PluginCommitUtilizationsContext from "@floro/database/src/contexts/repositories/PluginCommitUtilizationsContext";
import PluginsVersionsContext from "@floro/database/src/contexts/plugins/PluginVersionsContext";
import { DataSource, makeDataSource } from "floro/dist/src/datasource";
import { getRootSchemaMap, isTopologicalSubset, isTopologicalSubsetValid, manifestListToSchemaMap } from "floro/dist/src/plugins";
import { ApplicationKVState, getInvalidStates } from "floro/dist/src/repo";

@injectable()
export default class PublicApiV0Controller extends BaseController {
  public sessionStore: SessionStore;
  public contextFactory: ContextFactory;
  public mainConfig: MainConfig;
  public repoAccessor: RepoAccessor;
  public binaryAccessor: BinaryAccessor;
  public storageAuthenticator!: StorageAuthenticator;
  public databaseConnection!: DatabaseConnection;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(SessionStore) sessionStore: SessionStore,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(MainConfig) mainConfig: MainConfig,
    @inject(RepoAccessor) repoAccessor: RepoAccessor,
    @inject(BinaryAccessor) binaryAccessor: BinaryAccessor,
    @inject(StorageAuthenticator) storageAuthenticator: StorageAuthenticator
  ) {
    super();
    this.databaseConnection = databaseConnection;
    this.sessionStore = sessionStore;
    this.contextFactory = contextFactory;
    this.mainConfig = mainConfig;
    this.repoAccessor = repoAccessor;
    this.binaryAccessor = binaryAccessor;
    this.storageAuthenticator = storageAuthenticator;
  }

  @Get("/public/api/v0/healthcheck")
  public async getHealthcheck(_req, res) {
    res.send({
      ok: true,
    });
  }

  @Get("/public/api/v0/repositories")
  public async getRepositories(req, res) {
    const apiKeySecret = req?.headers?.["floro-api-key"];
    if (!apiKeySecret || typeof apiKeySecret != "string") {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const apiKeysContext = await this.contextFactory.createContext(
      ApiKeysContext
    );
    const apiKey = await apiKeysContext.getBySecret(apiKeySecret);
    if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const apiTrackingId = randomUUID();
    const repositoryEnabledApiKeysContext =
      await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    const enabledApiKeys =
      await repositoryEnabledApiKeysContext.getRepositoryEnabledApiKeysForKey(
        apiKey.id
      );

    const seenRepoIds = new Set<string>();
    const repos: Array<Repository> = [];
    for (const enabledKey of enabledApiKeys) {
      if (
        !seenRepoIds.has(enabledKey.repositoryId) &&
        !!enabledKey.repository
      ) {
        repos.push(enabledKey.repository);
        seenRepoIds.add(enabledKey.repositoryId);
      }
    }
    const repositories = repos.map((repository) => {
      return {
        id: repository.id,
        name: repository.name,
        defaultBranchId: repository.defaultBranchId,
      };
    });
    const payload = { repositories, apiTrackingId };
    res.send(payload);
    const apiEventContext = await this.contextFactory.createContext(
      ApiEventsContext
    );
    const hash = createHash("sha256");
    hash.update(JSON.stringify(payload));
    const payloadHash = hash.digest("hex");
    try {
      await apiEventContext.create({
        apiTrackingId,
        apiVersion: "0.0.0",
        didSucceed: true,
        statusCode: 200,
        requestPath: req.path,
        httpVerb: "GET",
        payloadHash,
        apiKeyId: apiKey.id,
      });
    } catch (e) {
      console.log("E", e);
    }
  }
  @Get("/public/api/v0/repository/:repositoryId")
  public async getRepsitory(req, res) {
    const apiKeySecret = req?.headers?.["floro-api-key"];
    const repositoryId = req?.params?.["repositoryId"];
    if (!apiKeySecret || typeof apiKeySecret != "string") {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    if (!repositoryId) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const apiKeysContext = await this.contextFactory.createContext(
      ApiKeysContext
    );
    const apiKey = await apiKeysContext.getBySecret(apiKeySecret);
    if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const apiTrackingId = randomUUID();
    const repositoryEnabledApiKeysContext =
      await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    const enabledApiKey =
      await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
        repositoryId,
        apiKey.id
      );
    if (!enabledApiKey) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const repositoryContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    const repository = await repositoryContext.getById(repositoryId);

    const payload = {
      repository: {
        id: repository?.id,
        name: repository?.name,
        defaultBranchId: repository?.defaultBranchId,
      },
      apiTrackingId,
    };
    res.send(payload);
    const apiEventContext = await this.contextFactory.createContext(
      ApiEventsContext
    );
    const hash = createHash("sha256");
    hash.update(JSON.stringify(payload));
    const payloadHash = hash.digest("hex");
    try {
      await apiEventContext.create({
        apiTrackingId,
        apiVersion: "0.0.0",
        didSucceed: true,
        statusCode: 200,
        requestPath: req.path,
        httpVerb: "GET",
        payloadHash,
        apiKeyId: apiKey.id,
        repositoryId,
        repositoryEnabledApiKeyId: enabledApiKey.id,
      });
    } catch (e) {
      console.log("E", e);
    }
  }

  @Get("/public/api/v0/repository/:repositoryId/branches")
  public async getBranches(req, res) {
    const apiKeySecret = req?.headers?.["floro-api-key"];
    const repositoryId = req?.params?.["repositoryId"];
    if (!apiKeySecret || typeof apiKeySecret != "string") {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    if (!repositoryId) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const apiKeysContext = await this.contextFactory.createContext(
      ApiKeysContext
    );
    const apiKey = await apiKeysContext.getBySecret(apiKeySecret);
    if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const apiTrackingId = randomUUID();
    const repositoryEnabledApiKeysContext =
      await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    const enabledApiKey =
      await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
        repositoryId,
        apiKey.id
      );
    if (!enabledApiKey) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }

    const branchesContext = await this.contextFactory.createContext(
      BranchesContext
    );
    const dbBranches = await branchesContext.getAllByRepoId(repositoryId);
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
    const payload = { branches, apiTrackingId };
    res.send(payload);
    const apiEventContext = await this.contextFactory.createContext(
      ApiEventsContext
    );
    const hash = createHash("sha256");
    hash.update(JSON.stringify(payload));
    const payloadHash = hash.digest("hex");
    try {
      await apiEventContext.create({
        apiTrackingId,
        apiVersion: "0.0.0",
        didSucceed: true,
        statusCode: 200,
        requestPath: req.path,
        httpVerb: "GET",
        payloadHash,
        apiKeyId: apiKey.id,
        repositoryId,
        repositoryEnabledApiKeyId: enabledApiKey.id,
      });
    } catch (e) {
      console.log("E", e);
    }
  }

  @Get("/public/api/v0/repository/:repositoryId/branch/:branchId")
  public async getBranch(req, res) {
    const apiKeySecret = req?.headers?.["floro-api-key"];
    const repositoryId = req?.params?.["repositoryId"];
    const branchId = req?.params?.["branchId"];
    if (!apiKeySecret || typeof apiKeySecret != "string") {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    if (!repositoryId || !branchId) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const apiKeysContext = await this.contextFactory.createContext(
      ApiKeysContext
    );
    const apiKey = await apiKeysContext.getBySecret(apiKeySecret);
    if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const apiTrackingId = randomUUID();
    const repositoryEnabledApiKeysContext =
      await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    const enabledApiKey =
      await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
        repositoryId,
        apiKey.id
      );
    if (!enabledApiKey) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }

    const branchesContext = await this.contextFactory.createContext(
      BranchesContext
    );
    const dbBranches = await branchesContext.getAllByRepoId(repositoryId);
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
    const branch = branches.find((b) => b.id == branchId.toLowerCase());
    if (!branch) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const payload = { branch, apiTrackingId };
    res.send(payload);
    const apiEventContext = await this.contextFactory.createContext(
      ApiEventsContext
    );
    const hash = createHash("sha256");
    hash.update(JSON.stringify(payload));
    const payloadHash = hash.digest("hex");
    try {
      await apiEventContext.create({
        apiTrackingId,
        apiVersion: "0.0.0",
        didSucceed: true,
        statusCode: 200,
        requestPath: req.path,
        httpVerb: "GET",
        payloadHash,
        apiKeyId: apiKey.id,
        repositoryId,
        repositoryEnabledApiKeyId: enabledApiKey.id,
      });
    } catch (e) {
      console.log("E", e);
    }
  }

  @Get("/public/api/v0/repository/:repositoryId/commit/:sha")
  public async getCommit(req, res) {
    const apiKeySecret = req?.headers?.["floro-api-key"];
    const repositoryId = req?.params?.["repositoryId"];
    const sha = req?.params?.["sha"];
    if (!apiKeySecret || typeof apiKeySecret != "string") {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    if (!repositoryId || !sha) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const apiKeysContext = await this.contextFactory.createContext(
      ApiKeysContext
    );
    const apiKey = await apiKeysContext.getBySecret(apiKeySecret);
    if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const apiTrackingId = randomUUID();
    const repositoryEnabledApiKeysContext =
      await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    const enabledApiKey =
      await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
        repositoryId,
        apiKey.id
      );
    if (!enabledApiKey) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );
    const hasCommit = await commitsContext.repoHasCommit(repositoryId, sha);
    if (!hasCommit) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const commit = await commitsContext.getCommitBySha(repositoryId, sha);
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
    const payload = { commit: safeCommit, apiTrackingId };
    res.send(payload);
    const apiEventContext = await this.contextFactory.createContext(
      ApiEventsContext
    );
    const hash = createHash("sha256");
    hash.update(JSON.stringify(payload));
    const payloadHash = hash.digest("hex");
    try {
      await apiEventContext.create({
        apiTrackingId,
        apiVersion: "0.0.0",
        didSucceed: true,
        statusCode: 200,
        requestPath: req.path,
        httpVerb: "GET",
        payloadHash,
        apiKeyId: apiKey.id,
        repositoryId,
        repositoryEnabledApiKeyId: enabledApiKey.id,
      });
    } catch (e) {
      console.log("E", e);
    }
  }

  @Get("/public/api/v0/repository/:repositoryId/commit/:sha/state")
  public async getCommitState(req, res) {
    const apiKeySecret = req?.headers?.["floro-api-key"];
    const repositoryId = req?.params?.["repositoryId"];
    const sha = req?.params?.["sha"];
    if (!apiKeySecret || typeof apiKeySecret != "string") {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    if (!repositoryId || !sha) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const apiKeysContext = await this.contextFactory.createContext(
      ApiKeysContext
    );
    const apiKey = await apiKeysContext.getBySecret(apiKeySecret);
    if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const apiTrackingId = randomUUID();
    const repositoryEnabledApiKeysContext =
      await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    const enabledApiKey =
      await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
        repositoryId,
        apiKey.id
      );
    if (!enabledApiKey) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );
    const repositoryContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    const repository = await repositoryContext.getById(repositoryId);
    const hasCommit = await commitsContext.repoHasCommit(repositoryId, sha);
    if (!hasCommit) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const state = await this.repoAccessor.readCommitState(
      repository as Repository,
      sha
    );
    const payload = { state, apiTrackingId };
    res.send(payload);
    const apiEventContext = await this.contextFactory.createContext(
      ApiEventsContext
    );
    const hash = createHash("sha256");
    hash.update(JSON.stringify(payload));
    const payloadHash = hash.digest("hex");
    try {
      await apiEventContext.create({
        apiTrackingId,
        apiVersion: "0.0.0",
        didSucceed: true,
        statusCode: 200,
        requestPath: req.path,
        httpVerb: "GET",
        payloadHash,
        apiKeyId: apiKey.id,
        repositoryId,
        repositoryEnabledApiKeyId: enabledApiKey.id,
      });
    } catch (e) {
      console.log("E", e);
    }
  }

  @Get("/public/api/v0/repository/:repositoryId/commit/:sha/stateLink")
  public async getCommitStateLink(req, res) {
    const apiKeySecret = req?.headers?.["floro-api-key"];
    const repositoryId = req?.params?.["repositoryId"];
    const sha = req?.params?.["sha"];
    if (!apiKeySecret || typeof apiKeySecret != "string") {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    if (!repositoryId || !sha) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const apiKeysContext = await this.contextFactory.createContext(
      ApiKeysContext
    );
    const apiKey = await apiKeysContext.getBySecret(apiKeySecret);
    if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const apiTrackingId = randomUUID();
    const repositoryEnabledApiKeysContext =
      await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    const enabledApiKey =
      await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
        repositoryId,
        apiKey.id
      );
    if (!enabledApiKey) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );
    const repositoryContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    const hasCommit = await commitsContext.repoHasCommit(repositoryId, sha);
    if (!hasCommit) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const repository = await repositoryContext.getById(repositoryId);
    const urlPath =
      "/" +
      this.repoAccessor.getRelativeCommitKVPath(repository as Repository, sha);
    const privateCdnUrl = this.mainConfig.privateRoot();
    const url = privateCdnUrl + urlPath;
    const stateLink = this.storageAuthenticator.signURL(url, urlPath, 3600);

    const payload = { stateLink, apiTrackingId };
    res.send(payload);
    const apiEventContext = await this.contextFactory.createContext(
      ApiEventsContext
    );
    const hash = createHash("sha256");
    hash.update(JSON.stringify(payload));
    const payloadHash = hash.digest("hex");
    try {
      await apiEventContext.create({
        apiTrackingId,
        apiVersion: "0.0.0",
        didSucceed: true,
        statusCode: 200,
        requestPath: req.path,
        httpVerb: "GET",
        payloadHash,
        apiKeyId: apiKey.id,
        repositoryId,
        repositoryEnabledApiKeyId: enabledApiKey.id,
      });
    } catch (e) {
      console.log("E", e);
    }
  }

  @Get("/public/api/v0/repository/:repositoryId/commit/:sha/binaries")
  public async getBinaries(req, res) {
    const apiKeySecret = req?.headers?.["floro-api-key"];
    const repositoryId = req?.params?.["repositoryId"];
    const sha = req?.params?.["sha"];
    if (!apiKeySecret || typeof apiKeySecret != "string") {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    if (!repositoryId || !sha) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const apiKeysContext = await this.contextFactory.createContext(
      ApiKeysContext
    );
    const apiKey = await apiKeysContext.getBySecret(apiKeySecret);
    if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const apiTrackingId = randomUUID();
    const repositoryEnabledApiKeysContext =
      await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    const enabledApiKey =
      await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
        repositoryId,
        apiKey.id
      );
    if (!enabledApiKey) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );
    const hasCommit = await commitsContext.repoHasCommit(repositoryId, sha);
    if (!hasCommit) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }

    const binaryCommitUtilizationsContext =
      await this.contextFactory.createContext(BinaryCommitUtilizationsContext);
    const binaryUtilizations =
      await binaryCommitUtilizationsContext.getAllByRepoAndSha(
        repositoryId,
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
          url: this.storageAuthenticator.signURL(url, urlPath, 3600)
      }
    });

    const payload = { binaries, apiTrackingId };
    res.send(payload);
    const apiEventContext = await this.contextFactory.createContext(
      ApiEventsContext
    );
    const hash = createHash("sha256");
    hash.update(JSON.stringify(payload));
    const payloadHash = hash.digest("hex");
    try {
      await apiEventContext.create({
        apiTrackingId,
        apiVersion: "0.0.0",
        didSucceed: true,
        statusCode: 200,
        requestPath: req.path,
        httpVerb: "GET",
        payloadHash,
        apiKeyId: apiKey.id,
        repositoryId,
        repositoryEnabledApiKeyId: enabledApiKey.id,
      });
    } catch (e) {
      console.log("E", e);
    }
  }

  @Get("/public/api/v0/repository/:repositoryId/commit/:sha/manifests")
  public async getManifests(req, res) {
    const apiKeySecret = req?.headers?.["floro-api-key"];
    const repositoryId = req?.params?.["repositoryId"];
    const sha = req?.params?.["sha"];
    if (!apiKeySecret || typeof apiKeySecret != "string") {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    if (!repositoryId || !sha) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const apiKeysContext = await this.contextFactory.createContext(
      ApiKeysContext
    );
    const apiKey = await apiKeysContext.getBySecret(apiKeySecret);
    if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const apiTrackingId = randomUUID();
    const repositoryEnabledApiKeysContext =
      await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    const enabledApiKey =
      await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
        repositoryId,
        apiKey.id
      );
    if (!enabledApiKey) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );
    const hasCommit = await commitsContext.repoHasCommit(repositoryId, sha);
    if (!hasCommit) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }

    const pluginCommitUtilizationsContext =
      await this.contextFactory.createContext(PluginCommitUtilizationsContext);
    const pluginUtilizations = await pluginCommitUtilizationsContext.getAllByRepoAndSha(
        repositoryId,
        sha
    )
    const pluginVersionIds = pluginUtilizations?.map(pu => pu.pluginVersionId);
    const pluginsVersionsContext =
      await this.contextFactory.createContext(PluginsVersionsContext);
    const pluginVersions = await pluginsVersionsContext.getByIds(pluginVersionIds);
    const manifests = pluginVersions.map(pv => {
      return JSON.parse(pv.manifest);
    })
    const payload = { manifests, apiTrackingId };
    res.send(payload);
    const apiEventContext = await this.contextFactory.createContext(
      ApiEventsContext
    );
    const hash = createHash("sha256");
    hash.update(JSON.stringify(payload));
    const payloadHash = hash.digest("hex");
    try {
      await apiEventContext.create({
        apiTrackingId,
        apiVersion: "0.0.0",
        didSucceed: true,
        statusCode: 200,
        requestPath: req.path,
        httpVerb: "GET",
        payloadHash,
        apiKeyId: apiKey.id,
        repositoryId,
        repositoryEnabledApiKeyId: enabledApiKey.id,
      });
    } catch (e) {
      console.log("E", e);
    }

  }

  @Get("/public/api/v0/repository/:repositoryId/commit/:sha/rootSchemaMap")
  public async getRootSchemaMap(req, res) {
    const apiKeySecret = req?.headers?.["floro-api-key"];
    const repositoryId = req?.params?.["repositoryId"];
    const sha = req?.params?.["sha"];
    if (!apiKeySecret || typeof apiKeySecret != "string") {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    if (!repositoryId || !sha) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const apiKeysContext = await this.contextFactory.createContext(
      ApiKeysContext
    );
    const apiKey = await apiKeysContext.getBySecret(apiKeySecret);
    if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const apiTrackingId = randomUUID();
    const repositoryEnabledApiKeysContext =
      await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    const enabledApiKey =
      await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
        repositoryId,
        apiKey.id
      );
    if (!enabledApiKey) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );
    const hasCommit = await commitsContext.repoHasCommit(repositoryId, sha);
    if (!hasCommit) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }

    const pluginCommitUtilizationsContext =
      await this.contextFactory.createContext(PluginCommitUtilizationsContext);
    const pluginUtilizations = await pluginCommitUtilizationsContext.getAllByRepoAndSha(
        repositoryId,
        sha
    )
    const pluginVersionIds = pluginUtilizations?.map(pu => pu.pluginVersionId);
    const pluginsVersionsContext =
      await this.contextFactory.createContext(PluginsVersionsContext);
    const pluginVersions = await pluginsVersionsContext.getByIds(pluginVersionIds);
    const manifests = pluginVersions.map(pv => {
      return JSON.parse(pv.manifest);
    });
    const datasource: DataSource = makeDataSource({
      getPluginManifest: (pluginName, pluginVersion) => {
        return manifests.find(m => m.name == pluginName && m.version == pluginVersion);
      }
    });
    const manifestMap = manifestListToSchemaMap(manifests);
    const rootSchemaMap = await getRootSchemaMap(datasource, manifestMap);
    const payload = { rootSchemaMap, apiTrackingId };
    res.send(payload);
    const apiEventContext = await this.contextFactory.createContext(
      ApiEventsContext
    );
    const hash = createHash("sha256");
    hash.update(JSON.stringify(payload));
    const payloadHash = hash.digest("hex");
    try {
      await apiEventContext.create({
        apiTrackingId,
        apiVersion: "0.0.0",
        didSucceed: true,
        statusCode: 200,
        requestPath: req.path,
        httpVerb: "GET",
        payloadHash,
        apiKeyId: apiKey.id,
        repositoryId,
        repositoryEnabledApiKeyId: enabledApiKey.id,
      });
    } catch (e) {
      console.log("E", e);
    }
  }

  @Get("/public/api/v0/repository/:repositoryId/commit/:sha/invalidityMap")
  public async getInvalidityMap(req, res) {
    const apiKeySecret = req?.headers?.["floro-api-key"];
    const repositoryId = req?.params?.["repositoryId"];
    const sha = req?.params?.["sha"];
    if (!apiKeySecret || typeof apiKeySecret != "string") {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    if (!repositoryId || !sha) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const apiKeysContext = await this.contextFactory.createContext(
      ApiKeysContext
    );
    const apiKey = await apiKeysContext.getBySecret(apiKeySecret);
    if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const apiTrackingId = randomUUID();
    const repositoryEnabledApiKeysContext =
      await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    const enabledApiKey =
      await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
        repositoryId,
        apiKey.id
      );
    if (!enabledApiKey) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );
    const hasCommit = await commitsContext.repoHasCommit(repositoryId, sha);
    if (!hasCommit) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }

    const pluginCommitUtilizationsContext =
      await this.contextFactory.createContext(PluginCommitUtilizationsContext);
    const pluginUtilizations = await pluginCommitUtilizationsContext.getAllByRepoAndSha(
        repositoryId,
        sha
    )
    const pluginVersionIds = pluginUtilizations?.map(pu => pu.pluginVersionId);
    const pluginsVersionsContext =
      await this.contextFactory.createContext(PluginsVersionsContext);
    const pluginVersions = await pluginsVersionsContext.getByIds(pluginVersionIds);
    const manifests = pluginVersions.map(pv => {
      return JSON.parse(pv.manifest);
    });
    const datasource: DataSource = makeDataSource({
      getPluginManifest: (pluginName, pluginVersion) => {
        return manifests.find(m => m.name == pluginName && m.version == pluginVersion);
      }
    });
    const repositoryContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    const repository = await repositoryContext.getById(repositoryId);
    const kvState = await this.repoAccessor.readCommitKV(
      repository as Repository,
      sha
    );
    const invalidityMap = await getInvalidStates(datasource, kvState as ApplicationKVState);
    const payload = { invalidityMap, apiTrackingId };
    res.send(payload);
    const apiEventContext = await this.contextFactory.createContext(
      ApiEventsContext
    );
    const hash = createHash("sha256");
    hash.update(JSON.stringify(payload));
    const payloadHash = hash.digest("hex");
    try {
      await apiEventContext.create({
        apiTrackingId,
        apiVersion: "0.0.0",
        didSucceed: true,
        statusCode: 200,
        requestPath: req.path,
        httpVerb: "GET",
        payloadHash,
        apiKeyId: apiKey.id,
        repositoryId,
        repositoryEnabledApiKeyId: enabledApiKey.id,
      });
    } catch (e) {
      console.log("E", e);
    }
  }

  @Get(
    "/public/api/v0/repository/:repositoryId/commit/:sha/isTopologicalSubset/:forwardSha/:pluginId"
  )
  public async getIsTopologicalSubset(req, res) {
    const apiKeySecret = req?.headers?.["floro-api-key"];
    const repositoryId = req?.params?.["repositoryId"];
    const sha = req?.params?.["sha"];
    const forwardSha = req?.params?.["forwardSha"];
    const pluginName = req?.params?.["pluginId"];
    if (!apiKeySecret || typeof apiKeySecret != "string") {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    if (!repositoryId || !sha || !forwardSha) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const apiKeysContext = await this.contextFactory.createContext(
      ApiKeysContext
    );
    const apiKey = await apiKeysContext.getBySecret(apiKeySecret);
    if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const apiTrackingId = randomUUID();
    const repositoryEnabledApiKeysContext =
      await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    const enabledApiKey =
      await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
        repositoryId,
        apiKey.id
      );
    if (!enabledApiKey) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );
    const hasCommit = await commitsContext.repoHasCommit(repositoryId, sha);
    if (!hasCommit) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const hasForwardCommit = await commitsContext.repoHasCommit(repositoryId, forwardSha);
    if (!hasForwardCommit) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }

    const pluginCommitUtilizationsContext =
      await this.contextFactory.createContext(PluginCommitUtilizationsContext);
    const pluginUtilizations = await pluginCommitUtilizationsContext.getAllByRepoAndSha(
        repositoryId,
        sha
    )
    const pluginVersionIds = pluginUtilizations?.map(pu => pu.pluginVersionId);
    const pluginsVersionsContext =
      await this.contextFactory.createContext(PluginsVersionsContext);
    const pluginVersions = await pluginsVersionsContext.getByIds(pluginVersionIds);
    const manifests = pluginVersions.map(pv => {
      return JSON.parse(pv.manifest);
    });


    const forwardPluginUtilizations = await pluginCommitUtilizationsContext.getAllByRepoAndSha(
        repositoryId,
        forwardSha
    )
    const forwardPluginVersionIds = forwardPluginUtilizations?.map(pu => pu.pluginVersionId);
    const forwardPluginVersions = await pluginsVersionsContext.getByIds(forwardPluginVersionIds);
    const forwardManifests = forwardPluginVersions.map(pv => {
      return JSON.parse(pv.manifest);
    });

    const mixedManifests = [...manifests, ...forwardManifests];

    const datasource: DataSource = makeDataSource({
      getPluginManifest: (pluginName, pluginVersion) => {
        return mixedManifests.find(m => m.name == pluginName && m.version == pluginVersion);
      }
    });
    const repositoryContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    const repository = await repositoryContext.getById(repositoryId);
    const [state, forwardState] = await Promise.all([
      this.repoAccessor.readCommitState(repository as Repository, sha) as Promise<{store: {[key: string]: object}}>,
      this.repoAccessor.readCommitState(repository as Repository, forwardSha) as Promise<{store: {[key: string]: object}}>,
    ]);
    const manifestMap = manifestListToSchemaMap(manifests);
    const forwardManifestMap = manifestListToSchemaMap(forwardManifests);

    let payload;
    if (!manifestMap?.[pluginName] || !forwardManifestMap?.[pluginName]) {
      payload = {
        isTopologicalSubset: false,
        apiTrackingId
      };
    } else {
      const isTopologicalSubsetResult = await isTopologicalSubset(
        datasource,
        manifestMap,
        state.store,
        forwardManifestMap,
        forwardState.store,
        pluginName
      );
      payload = {
        isTopologicalSubset: isTopologicalSubsetResult,
        apiTrackingId
      }
    }
    res.send(payload);
    const apiEventContext = await this.contextFactory.createContext(
      ApiEventsContext
    );
    const hash = createHash("sha256");
    hash.update(JSON.stringify(payload));
    const payloadHash = hash.digest("hex");
    try {
      await apiEventContext.create({
        apiTrackingId,
        apiVersion: "0.0.0",
        didSucceed: true,
        statusCode: 200,
        requestPath: req.path,
        httpVerb: "GET",
        payloadHash,
        apiKeyId: apiKey.id,
        repositoryId,
        repositoryEnabledApiKeyId: enabledApiKey.id,
      });
    } catch (e) {
      console.log("E", e);
    }
  }

  @Get(
    "/public/api/v0/repository/:repositoryId/commit/:sha/isTopologicalSubsetValid/:forwardSha/:pluginId"
  )
  public async getIsTopologicalSubsetValid(req, res) {
    const apiKeySecret = req?.headers?.["floro-api-key"];
    const repositoryId = req?.params?.["repositoryId"];
    const sha = req?.params?.["sha"];
    const forwardSha = req?.params?.["forwardSha"];
    const pluginName = req?.params?.["pluginId"];
    if (!apiKeySecret || typeof apiKeySecret != "string") {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    if (!repositoryId || !sha || !forwardSha) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const apiKeysContext = await this.contextFactory.createContext(
      ApiKeysContext
    );
    const apiKey = await apiKeysContext.getBySecret(apiKeySecret);
    if (!apiKey || apiKey?.isDeleted || !apiKey.isEnabled) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const apiTrackingId = randomUUID();
    const repositoryEnabledApiKeysContext =
      await this.contextFactory.createContext(RepositoryEnabledApiKeysContext);
    const enabledApiKey =
      await repositoryEnabledApiKeysContext.getByRepoAndApiKeyId(
        repositoryId,
        apiKey.id
      );
    if (!enabledApiKey) {
      res.status(403).json({
        message: "forbidden",
      });
      return;
    }
    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );
    const hasCommit = await commitsContext.repoHasCommit(repositoryId, sha);
    if (!hasCommit) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }
    const hasForwardCommit = await commitsContext.repoHasCommit(repositoryId, forwardSha);
    if (!hasForwardCommit) {
      res.status(404).json({
        message: "not found",
      });
      return;
    }

    const pluginCommitUtilizationsContext =
      await this.contextFactory.createContext(PluginCommitUtilizationsContext);
    const pluginUtilizations = await pluginCommitUtilizationsContext.getAllByRepoAndSha(
        repositoryId,
        sha
    )
    const pluginVersionIds = pluginUtilizations?.map(pu => pu.pluginVersionId);
    const pluginsVersionsContext =
      await this.contextFactory.createContext(PluginsVersionsContext);
    const pluginVersions = await pluginsVersionsContext.getByIds(pluginVersionIds);
    const manifests = pluginVersions.map(pv => {
      return JSON.parse(pv.manifest);
    });


    const forwardPluginUtilizations = await pluginCommitUtilizationsContext.getAllByRepoAndSha(
        repositoryId,
        forwardSha
    )
    const forwardPluginVersionIds = forwardPluginUtilizations?.map(pu => pu.pluginVersionId);
    const forwardPluginVersions = await pluginsVersionsContext.getByIds(forwardPluginVersionIds);
    const forwardManifests = forwardPluginVersions.map(pv => {
      return JSON.parse(pv.manifest);
    });

    const mixedManifests = [...manifests, ...forwardManifests];

    const datasource: DataSource = makeDataSource({
      getPluginManifest: (pluginName, pluginVersion) => {
        return mixedManifests.find(m => m.name == pluginName && m.version == pluginVersion);
      }
    });
    const repositoryContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    const repository = await repositoryContext.getById(repositoryId);
    const [state, forwardState] = await Promise.all([
      this.repoAccessor.readCommitState(repository as Repository, sha) as Promise<{store: {[key: string]: object}}>,
      this.repoAccessor.readCommitState(repository as Repository, forwardSha) as Promise<{store: {[key: string]: object}}>,
    ]);
    const manifestMap = manifestListToSchemaMap(manifests);
    const forwardManifestMap = manifestListToSchemaMap(forwardManifests);

    let payload;
    if (!manifestMap?.[pluginName] || !forwardManifestMap?.[pluginName]) {
      payload = {
        isTopologicalSubsetValid: false,
        apiTrackingId
      };
    } else {
      const isTopologicalSubsetValidResult = await isTopologicalSubsetValid(
        datasource,
        manifestMap,
        state.store,
        forwardManifestMap,
        forwardState.store,
        pluginName
      );
      payload = {
        isTopologicalSubsetValid: isTopologicalSubsetValidResult,
        apiTrackingId
      }
    }
    res.send(payload);
    const apiEventContext = await this.contextFactory.createContext(
      ApiEventsContext
    );
    const hash = createHash("sha256");
    hash.update(JSON.stringify(payload));
    const payloadHash = hash.digest("hex");
    try {
      await apiEventContext.create({
        apiTrackingId,
        apiVersion: "0.0.0",
        didSucceed: true,
        statusCode: 200,
        requestPath: req.path,
        httpVerb: "GET",
        payloadHash,
        apiKeyId: apiKey.id,
        repositoryId,
        repositoryEnabledApiKeyId: enabledApiKey.id,
      });
    } catch (e) {
      console.log("E", e);
    }
  }
}
