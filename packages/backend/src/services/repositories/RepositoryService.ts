import { injectable, inject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { User } from "@floro/database/src/entities/User";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import { REPO_REGEX } from "@floro/common-web/src/utils/validators";
import { Organization } from "@floro/database/src/entities/Organization";
import { Repository } from "@floro/database/src/entities/Repository";

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
  action: "REPO_CREATED" | "REPO_NAME_TAKEN_ERROR" | "INVALID_PARAMS_ERROR" | "LOG_ERROR";
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

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
  }

  public async createUserRepository(
    user: User,
    name: string,
    isPrivate: boolean,
    licenseCode?: string|null
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
          isPrivate,
          name: name.trim(),
        });
        await queryRunner.commitTransaction();
        return {
          action: "REPO_CREATED",
          repository,
        };
      } else {
        const repository = await repositoriesContext.createRepo({
          userId: user.id,
          createdByUserId: user.id,
          isPrivate,
          name: name.trim(),
          licenseCode: licenseCode as string,
        });
        await queryRunner.commitTransaction();
        return {
          action: "REPO_CREATED",
          repository,
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
    licenseCode?: string|null
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
          isPrivate,
          name: name.trim(),
        });
        await queryRunner.commitTransaction();
        return {
          action: "REPO_CREATED",
          repository,
        };
      } else {
        const repository = await repositoriesContext.createRepo({
          organizationId: organization.id,
          createdByUserId: currentUser.id,
          isPrivate,
          name: name.trim(),
          licenseCode: licenseCode as string,
        });
        await queryRunner.commitTransaction();
        return {
          action: "REPO_CREATED",
          repository,
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