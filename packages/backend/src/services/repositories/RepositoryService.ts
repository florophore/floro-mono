import { injectable, inject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RepoHelper from "@floro/database/src/contexts/utils/RepoHelper";
import { User } from "@floro/database/src/entities/User";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import { REPO_REGEX } from "@floro/common-web/src/utils/validators";
import { Organization } from "@floro/database/src/entities/Organization";
import { Repository } from "@floro/database/src/entities/Repository";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";

export const LICENSE_CODE_LIST = new Set([
  "apache_2",
  "gnu_general_public_3",
  "mit",
  "bsd2_simplified",
  "bsd3_new_or_revised",
  "boost",
  "creative_commons_zero_1_0",
  "eclipse_2",
  "gnu_affero_3",
  "gnu_general_2",
  "gnu_lesser_2_1",
  "mozilla_2",
  "unlicense",
]);

export interface CreateRepositoryReponse {
  action:
    | "REPO_CREATED"
    | "REPO_NAME_TAKEN_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "LOG_ERROR";
  repository?: Repository;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

@injectable()
export default class RepositoryService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private repoAccessor!: RepoAccessor;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoAccessor) repoAccessor: RepoAccessor
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.repoAccessor = repoAccessor;
  }

  public async createUserRepository(
    user: User,
    name: string,
    isPrivate: boolean,
    licenseCode?: string | null
  ): Promise<CreateRepositoryReponse> {
    if (!REPO_REGEX.test(name)) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing license code",
        },
      };
    }
    const hashKey = RepoHelper.getRepoHashUUID(user.username, name);
    if (!hashKey) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Invalid hash key",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );
      const userRepos = await repositoriesContext.getUserRepos(user.id);
      const userReposNames = new Set(
        userRepos?.map((repo) => repo?.name.toLowerCase().trim())
      );
      if (userReposNames.has(name?.toLowerCase().trim())) {
        await queryRunner.rollbackTransaction();
        return {
          action: "REPO_NAME_TAKEN_ERROR",
          error: {
            type: "REPO_NAME_TAKEN_ERROR",
            message: "Repo name already in use",
          },
        };
      }

      if (!isPrivate && (!licenseCode || !LICENSE_CODE_LIST.has(licenseCode))) {
        await queryRunner.rollbackTransaction();
        return {
          action: "INVALID_PARAMS_ERROR",
          error: {
            type: "INVALID_PARAMS_ERROR",
            message: "Missing license code",
          },
        };
      }

      if (isPrivate) {
        const repository = await repositoriesContext.createRepo({
          userId: user.id,
          createdByUserId: user.id,
          hashKey,
          isPrivate,
          name: name.trim(),
          repoType: "user_repo"
        });
        const loadedRepository = await repositoriesContext.getById(repository.id);
        if (!loadedRepository) {
          await queryRunner.rollbackTransaction();
          return {
            action: "LOG_ERROR",
            error: {
              type: "REPO_NOT_CREATED",
              message: "Repository not created",
            },
          };
        }
        await this.repoAccessor.initInitialRepoFoldersAndFiles(repository);
        await queryRunner.commitTransaction();
        return {
          action: "REPO_CREATED",
          repository: loadedRepository,
        };
      } else {
        const repository = await repositoriesContext.createRepo({
          userId: user.id,
          createdByUserId: user.id,
          hashKey,
          isPrivate,
          name: name.trim(),
          licenseCode: licenseCode as string,
          repoType: "user_repo"
        });
        const loadedRepository = await repositoriesContext.getById(repository.id);
        if (!loadedRepository) {
          await queryRunner.rollbackTransaction();
          return {
            action: "LOG_ERROR",
            error: {
              type: "REPO_NOT_CREATED",
              message: "Repository not created",
            },
          };
        }
        await this.repoAccessor.initInitialRepoFoldersAndFiles(repository);
        await queryRunner.commitTransaction();
        return {
          action: "REPO_CREATED",
          repository: loadedRepository,
        };
      }
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_REPOSITORY_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }
  public async createOrganizationRepository(
    organization: Organization,
    currentUser: User,
    name: string,
    isPrivate: boolean,
    licenseCode?: string | null
  ): Promise<CreateRepositoryReponse> {
    if (!REPO_REGEX.test(name)) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing license code",
        },
      };
    }
    const hashKey = RepoHelper.getRepoHashUUID(organization.handle, name);
    if (!hashKey) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Invalid hash key",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );
      const orgRepos = await repositoriesContext.getOrgRepos(organization.id);
      const orgReposNames = new Set(
        orgRepos?.map((repo) => repo?.name.toLowerCase().trim())
      );
      if (orgReposNames.has(name?.toLowerCase().trim())) {
        await queryRunner.rollbackTransaction();
        return {
          action: "REPO_NAME_TAKEN_ERROR",
          error: {
            type: "REPO_NAME_TAKEN_ERROR",
            message: "Repo name already in use",
          },
        };
      }

      if (!isPrivate && (!licenseCode || !LICENSE_CODE_LIST.has(licenseCode))) {
        await queryRunner.rollbackTransaction();
        return {
          action: "INVALID_PARAMS_ERROR",
          error: {
            type: "INVALID_PARAMS_ERROR",
            message: "Missing license code",
          },
        };
      }
      if (isPrivate) {
        const repository = await repositoriesContext.createRepo({
          organizationId: organization.id,
          createdByUserId: currentUser.id,
          hashKey,
          isPrivate,
          name: name.trim(),
          repoType: "org_repo"
        });
        const loadedRepository = await repositoriesContext.getById(repository.id);
        if (!loadedRepository) {
          await queryRunner.rollbackTransaction();
          return {
            action: "LOG_ERROR",
            error: {
              type: "REPO_NOT_CREATED",
              message: "Repository not created",
            },
          };
        }
        await this.repoAccessor.initInitialRepoFoldersAndFiles(repository);
        await queryRunner.commitTransaction();
        return {
          action: "REPO_CREATED",
          repository: loadedRepository,
        };
      } else {
        const repository = await repositoriesContext.createRepo({
          organizationId: organization.id,
          createdByUserId: currentUser.id,
          hashKey,
          isPrivate,
          name: name.trim(),
          licenseCode: licenseCode as string,
          repoType: "org_repo"
        });
        const loadedRepository = await repositoriesContext.getById(repository.id);
        if (!loadedRepository) {
          await queryRunner.rollbackTransaction();
          return {
            action: "LOG_ERROR",
            error: {
              type: "REPO_NOT_CREATED",
              message: "Repository not created",
            },
          };
        }
        await this.repoAccessor.initInitialRepoFoldersAndFiles(repository);
        await queryRunner.commitTransaction();
        return {
          action: "REPO_CREATED",
          repository: loadedRepository,
        };
      }
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_REPOSITORY_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async fetchRepoByName(ownerName?: string, repoName?: string) {
    const hashKey = RepoHelper.getRepoHashUUID(ownerName, repoName);
    if (!hashKey) {
      return null;
    }
    const repositoriesContext = await this.contextFactory.createContext(RepositoriesContext);
    return await repositoriesContext.getByHashKey(hashKey);
  }

  public async fetchRepoById(id?: string) {
    if (!id) {
      return null;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(RepositoriesContext);
      return await repositoriesContext.getById(id);
    } catch(e) {
      return null;
    }
  }
}