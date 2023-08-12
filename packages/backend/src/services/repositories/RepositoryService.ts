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
import BranchService from "./BranchService";
import OrganizationRolesContext from "@floro/database/src/contexts/organizations/OrganizationRolesContext";
import RepositoryEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledRoleSettingsContext";
import RepositoryEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledUserSettingsContext";
import RepoDataService from "./RepoDataService";

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

export interface CreateRepositoryResponse {
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
  private branchService!: BranchService;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoAccessor) repoAccessor: RepoAccessor,
    @inject(BranchService) branchService: BranchService,
    @inject(RepoDataService) repoDataService: RepoDataService,
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.repoAccessor = repoAccessor;
    this.branchService = branchService;
  }

  public async getRepository(id: string) {
    const repositoriesContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    return await repositoriesContext.getById(id);
  }

  public async createUserRepository(
    user: User,
    name: string,
    isPrivate: boolean,
    licenseCode?: string | null
  ): Promise<CreateRepositoryResponse> {
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
          repoType: "user_repo",
        });
        const loadedRepository = await repositoriesContext.getById(
          repository.id
        );
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
        await this.repoAccessor.initInitialRepoFoldersAndFiles(repository, null, user);
        // add branch
        await this.branchService.initMainBranch(queryRunner, repository, user);
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
          repoType: "user_repo",
        });
        const loadedRepository = await repositoriesContext.getById(
          repository.id
        );
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
        await this.repoAccessor.initInitialRepoFoldersAndFiles(repository, null, user);
        // add branch
        await this.branchService.initMainBranch(queryRunner, repository, user);
        // add branch rule
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
  ): Promise<CreateRepositoryResponse> {
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
          repoType: "org_repo",
        });
        const loadedRepository = await repositoriesContext.getById(
          repository.id
        );
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
        await this.repoAccessor.initInitialRepoFoldersAndFiles(repository, organization);
        await this.branchService.initMainBranch(
          queryRunner,
          repository,
          currentUser
        );
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
          repoType: "org_repo",
        });
        // we should add setting access rules here

        const organizationRolesContext =
          await this.contextFactory.createContext(
            OrganizationRolesContext,
            queryRunner
          );
        const adminRole =
          await organizationRolesContext.getRoleForOrgByPresetName(
            repository.organizationId,
            "admin"
          );

        const technicalAdminRole =
          await organizationRolesContext.getRoleForOrgByPresetName(
            repository.organizationId,
            "admin"
          );

        const repositoryEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            RepositoryEnabledRoleSettingsContext,
            queryRunner
          );

        const repositoryEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            RepositoryEnabledUserSettingsContext,
            queryRunner
          );

        await repositoryEnabledUserSettingsContext.create({
          settingName: "anyoneCanChangeSettings",
          repositoryId: repository.id,
          userId: currentUser.id,
        });

        await repositoryEnabledRoleSettingsContext.create({
          settingName: "anyoneCanChangeSettings",
          repositoryId: repository.id,
          roleId: adminRole.id,
        });

        if (technicalAdminRole) {
          await repositoryEnabledRoleSettingsContext.create({
            settingName: "anyoneCanChangeSettings",
            repositoryId: repository.id,
            roleId: technicalAdminRole.id,
          });
        }

        const loadedRepository = await repositoriesContext.getById(
          repository.id
        );
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
        await this.repoAccessor.initInitialRepoFoldersAndFiles(repository, organization);
        await this.branchService.initMainBranch(
          queryRunner,
          repository,
          currentUser
        );
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

}
