import { inject, injectable } from "inversify";

import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import { User } from "floro/dist/src/filestructure";
import WebhookKeysContext from "@floro/database/src/contexts/api_keys/WebhookKeysContext";
import { randomBytes } from "crypto";
import { Organization } from "@floro/graphql-schemas/build/generated/main-graphql";
import { WebhookKey } from "@floro/database/src/entities/WebhookKey";
import DNSHelper from "../../utils/DNSHelper";

export const TLD_DOMAIN =
  /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
export const SUBDOMAIN = /^(?![-.])[a-zA-Z0-9.-]+(?<![-.])$/;
export const PORT = /^d{1,5}$/;

export interface CreateApiKeyResponse {
  action: "CREATE_API_KEY_SUCCEEDED" | "LOG_ERROR";
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

@injectable()
export default class WebhookKeyService {
  private contextFactory!: ContextFactory;
  private databaseConnection!: DatabaseConnection;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection
  ) {
    this.contextFactory = contextFactory;
    this.databaseConnection = databaseConnection;
  }

  public async createUserWebhookKey(
    {
      domain,
      defaultSubdomain,
      defaultProtocol,
      defaultPort,
    }: {
      domain: string;
      defaultProtocol?: "https" | "http";
      defaultSubdomain?: string;
      defaultPort?: number;
    },
    user: User
  ) {
    if (domain?.trim?.() == "") {
      return {
        action: "INVALID_DOMAIN_ERROR",
        error: {
          type: "INVALID_DOMAIN_ERROR",
        },
      };
    }
    if (TLD_DOMAIN.test(domain)) {
      return {
        action: "INVALID_DOMAIN_ERROR",
        error: {
          type: "INVALID_DOMAIN_ERROR",
        },
      };
    }
    if (defaultSubdomain && !SUBDOMAIN.test(defaultSubdomain)) {
      return {
        action: "INVALID_DEFAULT_SUBDOMAIN_ERROR",
        error: {
          type: "INVALID_DEFAULT_SUBDOMAIN_ERROR",
        },
      };
    }

    if (
      defaultProtocol &&
      !(defaultProtocol == "http" || defaultProtocol == "https")
    ) {
      if (defaultSubdomain && !SUBDOMAIN.test(defaultSubdomain)) {
        return {
          action: "INVALID_DEFAULT_PROTOCOL_ERROR",
          error: {
            type: "INVALID_DEFAULT_PROTOCOL_ERROR",
          },
        };
      }
    }
    if (defaultPort && (defaultPort <= 1 || defaultPort >= 0xffff)) {
      if (defaultSubdomain && !SUBDOMAIN.test(defaultSubdomain)) {
        return {
          action: "INVALID_DEFAULT_PORT_ERROR",
          error: {
            type: "INVALID_DEFAULT_PORT_ERROR",
          },
        };
      }
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const webhookKeysContexts = await this.contextFactory.createContext(
        WebhookKeysContext,
        queryRunner
      );
      const webhookKeys = await webhookKeysContexts.getUserWebhookKeys(user.id);
      const existingKey = webhookKeys.find(
        (k) => k.domain == domain.toString()
      );
      if (existingKey) {
        await queryRunner.rollbackTransaction();
        return {
          action: "DOMAIN_EXISTS_ERROR",
          error: {
            type: "DOMAIN_EXISTS_ERROR",
          },
        };
      }
      let secret = randomBytes(32).toString("base64");
      let existingSecretKey = await webhookKeysContexts.getBySecret(secret);
      while (!!existingSecretKey) {
        existingSecretKey = await webhookKeysContexts.getBySecret(secret);
      }
      let dnsVerificationCode = randomBytes(32).toString("base64");
      const webhookKey = await webhookKeysContexts.create({
        secret,
        userId: user.id,
        createByUserId: user.id,
        keyType: "user_key",
        domain,
        isEnabled: true,
        dnsVerificationCode,
        isVerified: false,
        defaultPort,
        defaultSubdomain,
        defaultProtocol,
      });
      await queryRunner.commitTransaction();
      return {
        action: "CREATE_WEBHOOK_KEY_SUCCEEDED",
        webhookKey
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner?.rollbackTransaction?.();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_WEBHOOK_KEY_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      queryRunner.release();
    }
  }

  public async createOrgniazationWebhookKey(
    {
      domain,
      defaultSubdomain,
      defaultProtocol,
      defaultPort,
    }: {
      domain: string;
      defaultProtocol?: "https" | "http";
      defaultSubdomain?: string;
      defaultPort?: number;
    },
    organization: Organization,
    user: User
  ) {
    if (domain?.trim?.() == "") {
      return {
        action: "INVALID_DOMAIN_ERROR",
        error: {
          type: "INVALID_DOMAIN_ERROR",
        },
      };
    }
    if (TLD_DOMAIN.test(domain)) {
      return {
        action: "INVALID_DOMAIN_ERROR",
        error: {
          type: "INVALID_DOMAIN_ERROR",
        },
      };
    }
    if (defaultSubdomain && !SUBDOMAIN.test(defaultSubdomain)) {
      return {
        action: "INVALID_DEFAULT_SUBDOMAIN_ERROR",
        error: {
          type: "INVALID_DEFAULT_SUBDOMAIN_ERROR",
        },
      };
    }

    if (
      defaultProtocol &&
      !(defaultProtocol == "http" || defaultProtocol == "https")
    ) {
      if (defaultSubdomain && !SUBDOMAIN.test(defaultSubdomain)) {
        return {
          action: "INVALID_DEFAULT_PROTOCOL_ERROR",
          error: {
            type: "INVALID_DEFAULT_PROTOCOL_ERROR",
          },
        };
      }
    }
    if (defaultPort && (defaultPort <= 1 || defaultPort >= 0xffff)) {
      if (defaultSubdomain && !SUBDOMAIN.test(defaultSubdomain)) {
        return {
          action: "INVALID_DEFAULT_PORT_ERROR",
          error: {
            type: "INVALID_DEFAULT_PORT_ERROR",
          },
        };
      }
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const webhookKeysContexts = await this.contextFactory.createContext(
        WebhookKeysContext,
        queryRunner
      );
      const webhookKeys = await webhookKeysContexts.getOrganizationWebhookKeys(
        organization.id as string
      );
      const existingKey = webhookKeys.find(
        (k) => k.domain == domain.toString()
      );
      if (existingKey) {
        await queryRunner.rollbackTransaction();
        return {
          action: "DOMAIN_EXISTS_ERROR",
          error: {
            type: "DOMAIN_EXISTS_ERROR",
          },
        };
      }
      let secret = randomBytes(32).toString("base64");
      let existingSecretKey = await webhookKeysContexts.getBySecret(secret);
      while (!!existingSecretKey) {
        existingSecretKey = await webhookKeysContexts.getBySecret(secret);
      }
      let dnsVerificationCode = randomBytes(32).toString("base64");
      const webhookKey = await webhookKeysContexts.create({
        secret,
        organizationId: organization.id as string,
        createByUserId: user.id,
        keyType: "org_key",
        domain,
        isEnabled: true,
        dnsVerificationCode,
        isVerified: false,
        defaultPort,
        defaultSubdomain,
        defaultProtocol,
      });
      await queryRunner.commitTransaction();
      return {
        action: "CREATE_WEBHOOK_KEY_SUCCEEDED",
        webhookKey
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner?.rollbackTransaction?.();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_WEBHOOK_KEY_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      queryRunner.release();
    }
  }

  public async verifyWebhook(webhookKey: WebhookKey) {
    const isVerified = await DNSHelper.hasDnsVerificationRecord(webhookKey);
    if (!isVerified) {
      return {
        action: "WEBHOOK_VERIFICATION_FAILED",
        error: {
          type: "WEBHOOK_VERIFICATION_FAILED",
        },
      };
    }
    const webhookKeysContexts = await this.contextFactory.createContext(
      WebhookKeysContext
    );
    const updatedWebhookKey = await webhookKeysContexts.updateWebhookKey(webhookKey, {
      isVerified,
    });
    return {
      webhookKey: updatedWebhookKey,
      action: "WEBHOOK_VERIFICATION_SUCCEEDED",
    }
  }

  public async regenerateWebhookKey(webhookKey: WebhookKey) {
    const webhookKeysContexts = await this.contextFactory.createContext(
      WebhookKeysContext
    );
    let secret = randomBytes(32).toString("base64");
    let existingSecretKey = await webhookKeysContexts.getBySecret(secret);
    while (!!existingSecretKey) {
      existingSecretKey = await webhookKeysContexts.getBySecret(secret);
    }
    return await webhookKeysContexts.updateWebhookKey(webhookKey, { secret });
  }


  public async updateWebHookIsEnabled(
    webhookKey: WebhookKey,
    isEnabled: boolean
  ) {
    const webhookKeysContexts = await this.contextFactory.createContext(
      WebhookKeysContext
    );
    return await webhookKeysContexts.updateWebhookKey(webhookKey, {
      isEnabled
    });
  }

  public async updateWebhook(
    webhookKey: WebhookKey,
    {
      defaultPort,
      defaultProtocol,
      defaultSubdomain,
    }: {
      defaultProtocol?: "https" | "http";
      defaultSubdomain?: string;
      defaultPort?: number;
    }
  ) {
    if (defaultSubdomain && !SUBDOMAIN.test(defaultSubdomain)) {
      return {
        action: "INVALID_DEFAULT_SUBDOMAIN_ERROR",
        error: {
          type: "INVALID_DEFAULT_SUBDOMAIN_ERROR",
        },
      };
    }

    if (
      defaultProtocol &&
      !(defaultProtocol == "http" || defaultProtocol == "https")
    ) {
      if (defaultSubdomain && !SUBDOMAIN.test(defaultSubdomain)) {
        return {
          action: "INVALID_DEFAULT_PROTOCOL_ERROR",
          error: {
            type: "INVALID_DEFAULT_PROTOCOL_ERROR",
          },
        };
      }
    }
    if (defaultPort && (defaultPort <= 1 || defaultPort >= 0xffff)) {
      if (defaultSubdomain && !SUBDOMAIN.test(defaultSubdomain)) {
        return {
          action: "INVALID_DEFAULT_PORT_ERROR",
          error: {
            type: "INVALID_DEFAULT_PORT_ERROR",
          },
        };
      }
    }
    const webhookKeysContexts = await this.contextFactory.createContext(
      WebhookKeysContext
    );
    const updatedWebhookKey = await webhookKeysContexts.updateWebhookKey(webhookKey, {
      defaultPort,
      defaultProtocol,
      defaultSubdomain,
    });

    return {
      webhookKey: updatedWebhookKey,
      action: "WEBHOOK_UPDATE_SUCCEEDED",
    }
  }

  public async deleteWebhook(webhookKey: WebhookKey) {
    const webhookKeysContexts = await this.contextFactory.createContext(
      WebhookKeysContext
    );
    return await webhookKeysContexts.updateWebhookKey(webhookKey, {
      isDeleted: true,
    });
  }
}
