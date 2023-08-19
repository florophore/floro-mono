import { inject, injectable } from "inversify";

import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { User } from "floro/dist/src/filestructure";
import { Organization } from "@floro/graphql-schemas/build/generated/main-graphql";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ApiKeysContext from "@floro/database/src/contexts/api_keys/ApiKeysContext";
import { randomBytes } from "crypto";
import { ApiKey } from "@floro/database/src/entities/ApiKey";

export interface CreateApiKeyResponse {
  action:
    | "CREATE_API_KEY_SUCCEEDED"
    | "KEY_NAME_EXISTS_ERROR"
    | "INVALID_KEY_NAME_ERROR"
    | "UNKNOWN_CREATE_API_KEY_ERROR"
    | "LOG_ERROR";
  apiKeys: ApiKey[];
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

@injectable()
export default class ApiKeyService {
  private contextFactory!: ContextFactory;
  private databaseConnection!: DatabaseConnection;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection
  ) {
    this.contextFactory = contextFactory;
    this.databaseConnection = databaseConnection;
  }

  public async createUserApiKey(keyName: string, user: User) {
    if (keyName?.trim?.() == "") {
      return {
        action: "INVALID_KEY_NAME_ERROR",
        error: {
          type: "INVALID_KEY_NAME_ERROR",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const apiKeysContexts = await this.contextFactory.createContext(
        ApiKeysContext,
        queryRunner
      );
      const apiKeys = await apiKeysContexts.getUserApiKeys(user.id);
      const existingKey = apiKeys.find((k) => k.keyName == keyName.toString());
      if (existingKey) {
        await queryRunner.rollbackTransaction();
        return {
          action: "KEY_NAME_EXISTS_ERROR",
          error: {
            type: "KEY_NAME_EXISTS_ERROR",
          },
        };
      }
      let secret = randomBytes(32).toString("base64");
      let existingSecretKey = await apiKeysContexts.getBySecret(secret);
      while (!!existingSecretKey) {
        existingSecretKey = await apiKeysContexts.getBySecret(secret);
      }
      const apiKey = await apiKeysContexts.create({
        secret,
        userId: user.id,
        createdByUserId: user.id,
        keyType: "user_key",
        keyName,
        isEnabled: true,
      });
      await queryRunner.commitTransaction();
      return {
        action: "CREATE_API_KEY_SUCCEEDED",
        apiKey
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner?.rollbackTransaction?.();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_API_KEY_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      queryRunner.release();
    }
  }

  public async createOrgApiKey(
    keyName: string,
    user: User,
    organization: Organization
  ) {
    if (keyName?.trim?.() == "") {
      return {
        action: "INVALID_KEY_NAME_ERROR",
        error: {
          type: "INVALID_KEY_NAME_ERROR",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const apiKeysContexts = await this.contextFactory.createContext(
        ApiKeysContext,
        queryRunner
      );
      const apiKeys = await apiKeysContexts.getOrganizationApiKeys(
        organization.id as string
      );
      const existingKey = apiKeys.find((k) => k.keyName == keyName.toString());
      if (existingKey) {
        await queryRunner.rollbackTransaction();
        return {
          action: "KEY_NAME_EXISTS_ERROR",
          error: {
            type: "KEY_NAME_EXISTS_ERROR",
          },
        };
      }
      let secret = randomBytes(32).toString("base64");
      let existingSecretKey = await apiKeysContexts.getBySecret(secret);
      while (!!existingSecretKey) {
        existingSecretKey = await apiKeysContexts.getBySecret(secret);
      }
      const apiKey = await apiKeysContexts.create({
        secret,
        createdByUserId: user.id,
        organizationId: organization.id as string,
        keyType: "org_key",
        keyName,
        isEnabled: true,
      });
      await queryRunner.commitTransaction();
      return {
        action: "CREATE_API_KEY_SUCCEEDED",
        apiKey
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner?.rollbackTransaction?.();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_API_KEY_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      queryRunner.release();
    }
  }

  public async regenerateApiKey(apiKey: ApiKey) {
    const apiKeysContexts = await this.contextFactory.createContext(
      ApiKeysContext
    );
    let secret = randomBytes(32).toString("base64");
    let existingSecretKey = await apiKeysContexts.getBySecret(secret);
    while (!!existingSecretKey) {
      existingSecretKey = await apiKeysContexts.getBySecret(secret);
    }
    return await apiKeysContexts.updateApiKey(apiKey, { secret });
  }

  public async updateApiKeyIsEnabled(apiKey: ApiKey, isEnabled: boolean) {
    const apiKeysContexts = await this.contextFactory.createContext(
      ApiKeysContext
    );
    return await apiKeysContexts.updateApiKey(apiKey, { isEnabled });
  }

  public async deleteApiKey(apiKey: ApiKey) {
    const apiKeysContexts = await this.contextFactory.createContext(
      ApiKeysContext
    );
    return await apiKeysContexts.updateApiKey(apiKey, { isDeleted: true });
  }
}
