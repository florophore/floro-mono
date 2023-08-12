import { inject, injectable } from "inversify";
import BaseController from "./BaseController";
import { Get, Post } from "./annotations/HttpDecorators";
import AuthenticationService from "../services/authentication/AuthenticationService";
import SessionStore from "@floro/redis/src/sessions/SessionStore";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import MainConfig from "@floro/config/src/MainConfig";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import {
  CommitData,
  getDiffHash,
  hashBinary,
} from "floro/dist/src/sequenceoperations";
import {
  collectFileRefs
} from "floro/dist/src/plugins";
import {
  EMPTY_COMMIT_STATE,
  Branch as FloroBranch,
  applyStateDiffToCommitState,
  convertCommitStateToRenderedState,
  getInvalidStates
} from "floro/dist/src/repo";
import { commitDataContainsDevPlugins } from "floro/dist/src/repoapi";
import RepoRBACService from "../services/repositories/RepoRBACService";
import RepositoryService from "../services/repositories/RepositoryService";
import StorageAuthenticator from "@floro/storage/src/StorageAuthenticator";
import BinaryAccessor from "@floro/storage/src/accessors/BinaryAccessor";
import mime from "mime-types";
import BinariesContext from "@floro/database/src/contexts/repositories/BinariesContext";
import sizeof from "object-sizeof";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import PluginVersionsContext from "@floro/database/src/contexts/plugins/PluginVersionsContext";
import PluginsContext from "@floro/database/src/contexts/plugins/PluginsContext";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import CommitsContext from "@floro/database/src/contexts/repositories/CommitsContext";
import PluginCommitUtilizationsContext from "@floro/database/src/contexts/repositories/PluginCommitUtilizationsContext";
import BinaryCommitUtilizationsContext from "@floro/database/src/contexts/repositories/BinaryCommitUtilizationsContext";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import { Manifest, manifestListToSchemaMap } from "floro/dist/src/plugins";
import { makeDataSource } from "floro/dist/src/datasource";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import BranchService from "../services/repositories/BranchService";
import RepoDataService from "../services/repositories/RepoDataService";

@injectable()
export default class RepoController extends BaseController {
  public authenticationService: AuthenticationService;
  public sessionStore: SessionStore;
  public contextFactory: ContextFactory;
  public mainConfig: MainConfig;
  public repoAccessor: RepoAccessor;
  public binaryAccessor: BinaryAccessor;
  public repoRBAC: RepoRBACService;
  public repoDataService!: RepoDataService;
  public storageAuthenticator!: StorageAuthenticator;
  public databaseConnection!: DatabaseConnection;
  public branchService!: BranchService;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(AuthenticationService) authenticationService: AuthenticationService,
    @inject(SessionStore) sessionStore: SessionStore,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(MainConfig) mainConfig: MainConfig,
    @inject(RepoAccessor) repoAccessor: RepoAccessor,
    @inject(BinaryAccessor) binaryAccessor: BinaryAccessor,
    @inject(RepoRBACService) repoRBAC: RepoRBACService,
    @inject(RepoDataService) repoDataService: RepoDataService,
    @inject(StorageAuthenticator) storageAuthenticator: StorageAuthenticator,
    @inject(BranchService) branchService: BranchService
  ) {
    super();
    this.databaseConnection = databaseConnection;
    this.authenticationService = authenticationService;
    this.sessionStore = sessionStore;
    this.contextFactory = contextFactory;
    this.mainConfig = mainConfig;
    this.repoAccessor = repoAccessor;
    this.binaryAccessor = binaryAccessor;
    this.repoRBAC = repoRBAC;
    this.repoDataService = repoDataService;
    this.storageAuthenticator = storageAuthenticator;
    this.branchService = branchService;
  }

  @Get("/api/repo/:repoId/info")
  public async getInfo(request, response) {
    const repoId = request?.params?.repoId;
    if (!repoId) {
      response.sendStatus(404);
      return;
    }
    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session?.user) {
      response.sendStatus(403);
      return;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const repo = await repositoriesContext.getById(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }
      const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
        repo,
        session.user
      );
      if (canPull) {
        const info = {
            id: repo.id,
            name: repo.name,
            repoType: repo.repoType,
            userId: repo.userId,
            organizationId: repo.organizationId,
            ownerHandle: repo?.repoType == "user_repo" ? repo.user?.username : repo.organization?.handle,
        }
        response.send(info);
      } else {
        response.sendStatus(400);
      }
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Get("/api/repo/:repoId/clone")
  public async getBranchCommits(request, response) {
    const repoId = request?.params?.repoId;
    if (!repoId) {
      response.sendStatus(404);
      return;
    }
    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session?.user) {
      response.sendStatus(403);
      return;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const repo = await repositoriesContext.getById(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }
      const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
        repo,
        session.user
      );
      if (canPull) {
        const cloneInfo = await this.repoDataService.fetchCloneInfo(
          repo.id,
          session.user
        );
        response.send(cloneInfo);
      } else {
        response.sendStatus(400);
      }
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Post("/api/repo/:repoId/fetch")
  public async fetchPullList(request, response) {
    const repoId = request?.params?.repoId;
    const branchLeaves: Array<string> = request?.body?.branchLeaves ?? [];
    const branch: FloroBranch = request?.body?.branch ?? [];
    const plugins: Array<{
      name: string,
      version: string,
    }> = request?.body?.plugins ?? [];
    if (!repoId) {
      response.sendStatus(404);
      return;
    }
    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session?.user) {
      response.sendStatus(403);
      return;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const repo = await repositoriesContext.getById(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }
      const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
        repo,
        session.user
      );
      if (canPull) {
        const pullInfo = await this.repoDataService.fetchPullInfo(
          repo.id,
          session.user,
          branchLeaves,
          branch,
          plugins
        );
        response.send(pullInfo);
      } else {
        response.sendStatus(400);
      }
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Get("/api/repo/:repoId/commit/exists/:sha")
  public async getCommitExists(request, response) {
    const repoId = request?.params?.repoId;
    const sha = request?.params?.sha;
    if (!repoId || !sha) {
      response.sendStatus(404);
      return;
    }
    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session?.user) {
      response.sendStatus(403);
      return;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const repo = await repositoriesContext.getById(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }
      const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
        repo,
        session.user
      );
      if (canPull && sha) {
        const commit = await this.repoDataService.getCommit(repo.id, sha);
        response.send({
          exists: !!commit,
        });
        return;
      } else {
        response.sendStatus(400);
      }
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Get("/api/repo/:binaryRef/binary/exists/:fileName")
  public async getBinaryExists(request, response) {
    const repoId = request?.params?.repoId;
    const fileName = request?.params?.fileName;
    if (!repoId || !fileName) {
      response.sendStatus(404);
      return;
    }
    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session?.user) {
      response.sendStatus(403);
      return;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const repo = await repositoriesContext.getById(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }
      const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
        repo,
        session.user
      );
      if (canPull && fileName) {
        const binary = await this.repoDataService.getBinary(
          repo.id,
          fileName
        );
        if (!binary) {
          response.sendStatus(400);
          return;
        }
        response.send({
          exists: !!binary,
        });
        return;
      } else {
        response.sendStatus(400);
      }
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Get("/api/repo/:repoId/commit/link/:sha")
  public async getCommitLink(request, response) {
    const repoId = request?.params?.repoId;
    const sha = request?.params?.sha;
    if (!repoId || !sha) {
      response.sendStatus(404);
      return;
    }
    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session?.user) {
      response.sendStatus(403);
      return;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const repo = await repositoriesContext.getById(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }
      const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
        repo,
        session.user
      );
      if (canPull && sha) {
        // get commit list
        const commit = await this.repoDataService.getCommit(repo.id, sha);
        if (commit) {
          const privateCdnUrl = this.mainConfig.privateRoot();
          //const expiration = new Date().getTime() + (3600*1000);
          const urlPath = "/" + this.repoAccessor.getRelativeCommitPath(repo, sha);
          const url = privateCdnUrl + urlPath;
          const signedUrl = this.storageAuthenticator.signURL(
            url,
            urlPath,
            3600
          );
          response.send({
            sha,
            link: signedUrl,
          });
          return;
        }
      } else {
        response.sendStatus(400);
      }
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Get("/api/repo/:repoId/commit/state/link/:sha")
  public async getCommitStateLink(request, response) {
    const repoId = request?.params?.repoId;
    const sha = request?.params?.sha;
    if (!repoId || !sha) {
      response.sendStatus(404);
      return;
    }
    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session?.user) {
      response.sendStatus(403);
      return;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const repo = await repositoriesContext.getById(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }
      const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
        repo,
        session.user
      );
      if (canPull && sha) {
        // get commit list
        const commit = await this.repoDataService.getCommit(repo.id, sha);
        if (commit) {
          const privateCdnUrl = this.mainConfig.privateRoot();
          //const expiration = new Date().getTime() + (3600*1000);
          const urlPath = "/" + this.repoAccessor.getRelativeCommitStatePath(
            repo,
            sha
          );
          const url = privateCdnUrl + urlPath;
          const signedUrl = this.storageAuthenticator.signURL(
            url,
            urlPath,
            3600
          );
          response.send({
            sha,
            link: signedUrl,
          });
          return;
        }
      } else {
        response.sendStatus(400);
      }
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Get("/api/repo/:repoId/commit/kv/link/:sha")
  public async getCommitKVLink(request, response) {
    const repoId = request?.params?.repoId;
    const sha = request?.params?.sha;
    if (!repoId || !sha) {
      response.sendStatus(404);
      return;
    }
    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session?.user) {
      response.sendStatus(403);
      return;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const repo = await repositoriesContext.getById(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }
      const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
        repo,
        session.user
      );
      if (canPull && sha) {
        // get commit list
        const commit = await this.repoDataService.getCommit(repo.id, sha);
        if (commit) {
          const privateCdnUrl = this.mainConfig.privateRoot();
          //const expiration = new Date().getTime() + (3600*1000);
          const urlPath = "/" + this.repoAccessor.getRelativeCommitKVPath(repo, sha);
          const url = privateCdnUrl + urlPath;
          const signedUrl = this.storageAuthenticator.signURL(
            url,
            urlPath,
            3600
          );
          response.send({
            sha,
            link: signedUrl,
          });
          return;
        }
      } else {
        response.sendStatus(400);
      }
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Post("/api/repo/:repoId/binary/links")
  public async getBinaryLinks(request, response) {
    const repoId = request?.params?.repoId;
    const links = request?.body?.links;
    if (!repoId) {
      response.sendStatus(404);
      return;
    }
    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session?.user) {
      response.sendStatus(403);
      return;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const repo = await repositoriesContext.getById(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }
      const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
        repo,
        session.user
      );
      if (canPull && links && Array.isArray(links)) {
        const links: Array<{ fileName: string; link: string }> = [];
        for (const fileName of links) {
          if (!fileName || typeof fileName != "string") {
            response.sendStatus(400);
            return;
          }
          const binary = await this.repoDataService.getBinary(
            repo.id,
            fileName
          );
          if (!binary) {
            response.sendStatus(400);
            return;
          }

          const privateCdnUrl = this.mainConfig.privateRoot();
          //const expiration = new Date().getTime() + (3600*1000);
          const urlPath = "/" + this.binaryAccessor.getRelativeBinaryPath(fileName);
          const url = privateCdnUrl + urlPath;
          const signedUrl = this.storageAuthenticator.signURL(
            url,
            urlPath,
            3600
          );
          links.push({
            fileName,
            link: signedUrl,
          });
        }
        response.send(links);
        return;
      } else {
        response.sendStatus(400);
      }
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Get("/api/repo/:repoId/binary/link/:fileName")
  public async getBinaryLink(request, response) {
    const repoId = request?.params?.repoId;
    const fileName = request?.params?.fileName;
    if (!repoId) {
      response.sendStatus(404);
      return;
    }
    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session?.user) {
      response.sendStatus(403);
      return;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const repo = await repositoriesContext.getById(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }
      const canPull = await this.repoRBAC.userHasPermissionToPullOrClone(
        repo,
        session.user
      );
      if (canPull && fileName) {
        // get commit list
        const binary = await this.repoDataService.getBinary(
          repo.id,
          fileName
        );
        if (binary) {
          const privateCdnUrl = this.mainConfig.privateRoot();
          //const expiration = new Date().getTime() + (3600*1000);
          const urlPath = "/" + this.binaryAccessor.getRelativeBinaryPath(fileName);
          const url = privateCdnUrl + urlPath;
          const signedUrl = this.storageAuthenticator.signURL(
            url,
            urlPath,
            3600
          );
          response.send({
            fileName,
            link: signedUrl,
          });
          return;
        }
      } else {
        response.sendStatus(400);
      }
    } catch (e) {
      response.sendStatus(400);
    }
  }

  @Post("/api/repo/:repoId/push/binary")
  public async pushBinary(request, response) {
    const repoId = request?.params?.repoId;
    const branchId: string | undefined = request?.query?.branch;
    if (!repoId) {
      response.sendStatus(404);
      return;
    }

    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session?.user) {
      response.sendStatus(403);
      return;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const repo = await repositoriesContext.getById(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }
      const canPush = await this.repoRBAC.userHasPermissionToPush(
        repo,
        session.user,
        branchId
      );
      if (!canPush) {
        response.sendStatus(403);
        return;
      }

      if (request.busboy) {
        let numFiles = 0;
        let didCancel = false;
        request.busboy.on("file", (_, file, info) => {
          const extension = mime.extension(info.mimeType);
          if (!extension) {
            didCancel = true;
            request.sendStatus(400);
            return;
          }
          if (!didCancel) {
            numFiles++;
            if (numFiles > 1) {
              didCancel = true;
              request.sendStatus(400);
              return;
            }
          }
          let fileData: Buffer | null = null;
          file.on("data", (data, err) => {
            if (err) {
              didCancel = true;
              request.sendStatus(400);
              return;
            }
            if (!didCancel) {
              if (fileData == null) {
                fileData = data;
              } else {
                fileData = Buffer.concat([fileData, data]);
              }
            }
          });
          file.on("end", async (err) => {
            try {
              if (didCancel || fileData == null) {
                return;
              }
              if (err) {
                didCancel = true;
                request.sendStatus(400);
                return;
              }

              const sha = hashBinary(fileData);
              const filename = `${sha}.${extension}`;

              const binariesContext = await this.contextFactory.createContext(
                BinariesContext
              );
              const hasUploadedBinary = await binariesContext.hasUploadedBinary(
                filename
              );
              if (!hasUploadedBinary) {
                const didWrite = await this.binaryAccessor.writeBinary(
                  filename,
                  fileData
                );
                if (!didWrite) {
                  didCancel = true;
                  request.sendStatus(400);
                  return;
                }
              }

              const repoHasBinary = await binariesContext.repoHasBinary(
                repoId,
                filename
              );
              if (repoHasBinary) {
                response.send({
                  ack: true,
                });
                return;
              }

              const byteSize = sizeof(fileData);

              if (repo?.isPrivate) {
                if (repo.repoType == "org_repo") {
                  const organizationsContext =
                    await this.contextFactory.createContext(
                      OrganizationsContext
                    );
                  const organization = await organizationsContext.getById(
                    repo.organizationId
                  );
                  const utilizedDiskSpaceBytes = parseInt(
                    organization?.utilizedDiskSpaceBytes as unknown as string
                  );
                  await organizationsContext.updateOrganizationById(
                    organization?.id as string,
                    {
                      utilizedDiskSpaceBytes: utilizedDiskSpaceBytes + byteSize,
                    }
                  );
                } else {
                  const usersContext = await this.contextFactory.createContext(
                    UsersContext
                  );
                  const utilizedDiskSpaceBytes = parseInt(
                    session.user?.utilizedDiskSpaceBytes as unknown as string
                  );

                  await usersContext.updateUserById(session?.userId as string, {
                    utilizedDiskSpaceBytes: utilizedDiskSpaceBytes + byteSize,
                  });
                }
              }
              const insertedBinary = await binariesContext.create({
                sha,
                fileName: filename,
                mimeType: info.mimeType,
                fileExtension: extension,
                byteSize,
                createdById: session.userId,
                organizationId: repo.organizationId,
                repositoryId: repo.id,
              });

              if (!insertedBinary?.id) {
                didCancel = true;
                request.sendStatus(400);
                return;
              }

              response.send({
                ack: true,
              });
              return;
            } catch (e) {
              didCancel = true;
              request.sendStatus(400);
              return;
            }
          });
        });
        request.pipe(request.busboy);
      } else {
        response.status(400).json({
          message: "Malformed request.",
        });
      }
    } catch (e) {
      console.log("push binary error", e);
      response.sendStatus(400);
      return;
    }
  }

  @Post("/api/repo/:repoId/push/commit")
  public async pushCommit(request, response) {
    const repoId = request?.params?.repoId;
    const branchId: string | undefined = request?.query?.branch;
    const commitData: CommitData = request?.body?.commitData;

    if (!repoId) {
      response.sendStatus(404);
      return;
    }
    if (!commitData) {
      response.sendStatus(400);
      return;
    }

    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);

    if (!session?.user) {
      response.sendStatus(403);
      return;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const repo = await repositoriesContext.getById(repoId);
      if (!repo) {
        response.sendStatus(404);
        return;
      }
      const canPush = await this.repoRBAC.userHasPermissionToPush(
        repo,
        session.user,
        branchId
      );

      if (!canPush || !commitData.sha) {
        response.sendStatus(403);
        return;
      }

      const commitsContext = await this.contextFactory.createContext(
        CommitsContext
      );
      const repoHasCommit = await commitsContext.repoHasCommit(
        repoId,
        commitData.sha
      );
      if (repoHasCommit) {
        response.send({
          ack: true,
        });
        return;
      }
      if (typeof commitData?.idx != "number") {
        response.sendStatus(400);
        return;
      }

      let parentIdx: number = -1;
      let parentId: string | undefined;
      if (commitData.parent) {
        const parentCommit = await this.repoDataService.getCommit(
          repoId,
          commitData.parent
        );
        if (!parentCommit) {
          response.sendStatus(400);
          return;
        }
        parentId = parentCommit.id;
        parentIdx = parentCommit.idx ?? 0;
      }

      if (
        commitData.historicalParent != commitData.parent &&
        commitData.historicalParent
      ) {
        const historicalParentCommit = await this.repoDataService.getCommit(
          repoId,
          commitData.historicalParent
        );
        if (!historicalParentCommit) {
          response.sendStatus(400);
          return;
        }
      }

      const diffSha = getDiffHash(commitData);
      if (diffSha != commitData.sha) {
        response.sendStatus(400);
        return;
      }
      const containsDevPlugins = commitDataContainsDevPlugins(commitData);
      if (containsDevPlugins) {
        response.sendStatus(400);
        return;
      }

      if (!commitData?.userId) {
        response.sendStatus(400);
        return;
      }

      const usersContext = await this.contextFactory.createContext(
        UsersContext
      );
      const commitUser = await usersContext.getById(commitData?.userId);
      if (!commitUser || commitUser.username != commitData.username) {
        response.sendStatus(400);
        return;
      }
      if (repo.repoType == "org_repo" && repo?.isPrivate) {
        const organizationsMembersContext =
          await this.contextFactory.createContext(OrganizationMembersContext);

        const membership =
          await organizationsMembersContext.getByOrgIdAndUserId(
            repo.organizationId,
            commitUser.id
          );
        // should test if org_repo if user if member (does not need to be active)
        if (!membership) {
          response.sendStatus(400);
          return;
        }
      }

      if (repo.repoType == "user_repo" && repo.isPrivate) {
        if (commitUser.id != session.userId) {
          response.sendStatus(400);
          return;
        }
      }

      if (commitData?.authorUserId) {
        const authorUser = await usersContext.getById(commitData?.authorUserId);
        // should test if org_repo if user if member (does not need to be active)
        if (!authorUser || authorUser.username != commitData.authorUsername) {
          response.sendStatus(400);
          return;
        }
        if (repo.repoType == "org_repo" && repo?.isPrivate) {
          const organizationsMembersContext =
            await this.contextFactory.createContext(OrganizationMembersContext);

          const authorMembership =
            await organizationsMembersContext.getByOrgIdAndUserId(
              repo.organizationId,
              authorUser.id
            );
          // should test if org_repo if user if member (does not need to be active)
          if (!authorMembership) {
            response.sendStatus(400);
            return;
          }
        }
        if (repo.repoType == "user_repo" && repo.isPrivate) {
          if (authorUser.id != session.userId) {
            response.sendStatus(400);
            return;
          }
        }
      }

      if (!commitData?.message) {
        response.sendStatus(400);
        return;
      }

      if (commitData?.idx != parentIdx + 1) {
        response.sendStatus(400);
        return;
      }
      const binaryRefs = Object.values(commitData.diff.binaries.add);

      const binariesContext = await this.contextFactory.createContext(
        BinariesContext
      );
      for (const filename of binaryRefs) {
        const repoHasBinary = await binariesContext.repoHasBinary(
          repoId,
          filename
        );
        if (!repoHasBinary) {
          response.sendStatus(400);
          return;
        }
      }

      const pluginVersionsContext = await this.contextFactory.createContext(
        PluginVersionsContext
      );
      const pluginsContext = await this.contextFactory.createContext(
        PluginsContext
      );

      const pluginCommitUtilizationsContext =
        await this.contextFactory.createContext(PluginCommitUtilizationsContext);
      const pluginIdMappings: {
        [key: string]: { pluginId: string; pluginVersionId: string };
      } = {};
      const pluginList = Object.values(commitData?.diff?.plugins?.add);
      for (const { key: pluginName, value: pluginSemVer } of pluginList) {
        const pluginVersion = await pluginVersionsContext.getByNameAndVersion(
          pluginName,
          pluginSemVer
        );

        if (!pluginVersion) {
          response.sendStatus(400);
          return;
        }

        if (pluginVersion.state != "released") {
          response.sendStatus(400);
          return;
        }
        const plugin = await pluginsContext.getByNameKey(pluginVersion.nameKey);
        if (!plugin) {
          response.sendStatus(400);
          return;
        }
        pluginIdMappings[pluginName] = {
          pluginId: plugin.id,
          pluginVersionId: pluginVersion.id,
        };

        if (pluginVersion.isPrivate) {
          if (
            pluginVersion.ownerType == "org_plugin" &&
            (!plugin.isPrivate ||
              plugin.ownerType != "org_plugin" ||
              repo.repoType != "org_repo" ||
              !plugin.organizationId ||
              !pluginVersion.organizationId ||
              plugin.organizationId != repo.organizationId ||
              plugin.organizationId != pluginVersion.organizationId)
          ) {
            response.sendStatus(400);
            return;
          }

          if (
            pluginVersion.ownerType == "user_plugin" &&
            (!plugin.isPrivate ||
              plugin.ownerType != "user_plugin" ||
              repo.repoType != "userRepo" ||
              !plugin.userId ||
              !pluginVersion.userId ||
              plugin.userId != repo.userId ||
              plugin.userId != pluginVersion.userId)
          ) {
            response.sendStatus(400);
            return;
          }
        }
      }

      const repoHasCommitSecondCheck = await commitsContext.repoHasCommit(
        repoId,
        commitData.sha
      );
      if (repoHasCommitSecondCheck) {
        response.send({
          ack: true,
        });
        return;
      }
      const previousCommitKV = !commitData?.parent
        ? EMPTY_COMMIT_STATE
        : await this.repoAccessor.readCommitKV(repo, commitData?.parent);
      if (!previousCommitKV) {
        response.sendStatus(400);
        return;
      }
      const kvState = applyStateDiffToCommitState(
        previousCommitKV,
        commitData.diff
      );
      const manifests: Array<Manifest> = await Promise.all(
        kvState.plugins.map(async ({ key, value }) => {
          const pluginVersion = await pluginVersionsContext.getByNameAndVersion(
            key,
            value
          );
          return JSON.parse(pluginVersion?.manifest ?? "") as Manifest;
        })
      );

      const schemaMap = manifestListToSchemaMap(manifests);
      const datasource = makeDataSource({
        getPluginManifest: async (pluginName: string) => {
          return schemaMap[pluginName];
        },
      });
      const apiStoreInvalidity = await getInvalidStates(
        datasource,
        kvState
      );


      let isValid = true;
      for (const plugin in apiStoreInvalidity) {
        if (apiStoreInvalidity[plugin]?.length > 0) {
          isValid = false;
          break;
        }
      }

      const state = await convertCommitStateToRenderedState(
        datasource,
        kvState
      );
      const binaries = await collectFileRefs(datasource, schemaMap, state.store);

      const didWriteCommit = await this.repoAccessor.writeCommit(
        repo,
        commitData
      );
      if (!didWriteCommit) {
        response.sendStatus(400);
        return;
      }

      const didWriteKV = await this.repoAccessor.writeCommitKV(
        repo,
        commitData.sha,
        kvState
      );
      if (!didWriteKV) {
        response.sendStatus(400);
        return;
      }

      const didWriteState = await this.repoAccessor.writeCommitState(
        repo,
        commitData.sha,
        state
      );
      if (!didWriteState) {
        response.sendStatus(400);
        return;
      }

      const repoHasCommitThirdCheck = await commitsContext.repoHasCommit(
        repoId,
        commitData.sha
      );
      if (repoHasCommitThirdCheck) {
        response.send({
          ack: true,
        });
        return;
      }
      const byteSize = sizeof(commitData) + sizeof(kvState) + sizeof(state);
      if (repo?.isPrivate) {
        if (repo.repoType == "org_repo") {
          const organizationsContext = await this.contextFactory.createContext(
            OrganizationsContext
          );
          const organization = await organizationsContext.getById(
            repo.organizationId
          );
          const utilizedDiskSpaceBytes = parseInt(
            organization?.utilizedDiskSpaceBytes as unknown as string
          );
          await organizationsContext.updateOrganizationById(
            organization?.id as string,
            {
              utilizedDiskSpaceBytes: utilizedDiskSpaceBytes + byteSize,
            }
          );
        } else {
          const usersContext = await this.contextFactory.createContext(
            UsersContext
          );
          const utilizedDiskSpaceBytes = parseInt(
            session.user?.utilizedDiskSpaceBytes as unknown as string
          );
          await usersContext.updateUserById(session?.userId as string, {
            utilizedDiskSpaceBytes: utilizedDiskSpaceBytes + byteSize,
          });
        }
      }

      const diffByteSize = sizeof(commitData);
      const kvByteSize = sizeof(kvState);
      const stateByteSize = sizeof(state);
      const insertedCommit = await commitsContext.create({
        sha: commitData.sha,
        parent: commitData.parent as string,
        parentId,
        message: commitData.message,
        historicalParent: commitData?.historicalParent as string,
        idx: commitData?.idx as number,
        mergeBase: commitData?.mergeBase as string,
        mergeRevertSha: commitData?.mergeRevertSha as string,
        revertFromSha: commitData?.revertFromSha as string,
        revertToSha: commitData?.revertToSha as string,
        byteSize,
        diffByteSize,
        kvByteSize,
        stateByteSize,
        isValid,
        username: commitData.username,
        originalSha: commitData.originalSha,
        userId: commitData.userId,
        authorUsername: commitData.authorUsername ?? commitData?.username,
        authorUserId: commitData.authorUserId ?? commitData?.userId,
        timestamp: commitData.timestamp,
        organizationId: repo?.organizationId,
        repositoryId: repo?.id,
      });

      const binaryCommitUtilizationsContext = await this.contextFactory.createContext(BinaryCommitUtilizationsContext);

      const seenBinaries = new Set<string>();
      for(const binary of binaries) {
        if (!seenBinaries.has(binary)) {
          // insert binary_utilizations
          const bin = await binariesContext.getRepoBinaryByFilename(repo.id, binary);
          // if not, this will blow up the world
          if (bin) {
            await binaryCommitUtilizationsContext.create({
              commitSha: commitData.sha,
              commitId: insertedCommit.id,
              userId: commitData.userId,
              organizationId: repo?.organizationId ?? undefined,
              repositoryId: repo?.id,
              binaryId: bin.id,
              binaryHash: bin.sha,
              binaryFileName: bin.fileName,
            });
          }
          seenBinaries.add(binary);
        }
      }


      if (!insertedCommit) {
        response.sendStatus(400);
        return;
      }
      for (const {
        key: pluginName,
        value: pluginVersionNumber,
         } of state.plugins) {
        const pluginVersion = await pluginVersionsContext.getByNameAndVersion(
          pluginName,
          pluginVersionNumber
        );

        if (!pluginVersion) {
          response.sendStatus(400);
          return;
        }

        if (pluginVersion.state != "released") {
          response.sendStatus(400);
          return;
        }
        const plugin = await pluginsContext.getByNameKey(pluginVersion.nameKey);
        if (!plugin) {
          response.sendStatus(400);
          return;
        }
        const pluginId = plugin.id;
        const pluginVersionId = pluginVersion.id;
        const additions = Object.keys(
          commitData?.diff?.store?.[pluginName]?.add ?? {}
        ).length;
        const removals = Object.keys(
          commitData?.diff?.store?.[pluginName]?.remove ?? {}
        ).length;
        const byteSize = sizeof(state.store[pluginName]);
        await pluginCommitUtilizationsContext.create({
          commitSha: commitData.sha,
          commitId: insertedCommit.id,
          userId: commitData.userId,
          organizationId: repo?.organizationId ?? undefined,
          repositoryId: repo?.id,
          pluginId,
          pluginVersionId,
          pluginName,
          pluginVersionNumber,
          additions,
          removals,
          byteSize,
        });
      }
      response.send({
        ack: true,
      });
    } catch (e) {
      response.sendStatus(400);
      console.log("push commit error", e);
      return;
    }
  }

  @Post("/api/repo/:repoId/push/branch")
  public async pushBranch(request, response) {
    const repoId = request?.params?.repoId;
    const branch: FloroBranch = request?.body?.branch;
    if (!repoId || !branch?.id) {
      response.sendStatus(404);
      return;
    }

    const sessionKey = request.headers["session_key"];
    const session = await this.sessionStore.fetchSession(sessionKey);
    if (!session?.user) {
      response.sendStatus(403);
      return;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const repo = await repositoriesContext.getById(repoId);
      if (!repo) {
        response.sendStatus(400);
        return;
      }
      const canPush = await this.repoRBAC.userHasPermissionToPush(
        repo,
        session.user,
        branch.id,
      );
      if (!canPush) {
        response.sendStatus(400);
        return;
      }
      const branchResult = await this.branchService.pushBranch(branch, repoId, session.user);
      if (branchResult.action != "BRANCH_PUSHED") {
        response.sendStatus(400);
          console.error(
            branchResult?.error?.type,
            branchResult?.error?.message,
            branchResult?.error?.meta
          );
        return;
      }
      const pullInfo = await this.repoDataService.fetchPullInfo(
        repoId,
        session.user,
        []
      );
      response.send(pullInfo);
      this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repoId}`, {
        repositoryUpdated: repo
      });
      // send webhook notification here
      return;
    } catch (e) {
      response.sendStatus(400);
      console.log("push branch error", e);
      return;
    }
  }
}
