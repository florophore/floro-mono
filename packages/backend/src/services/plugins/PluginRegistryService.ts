import { injectable, inject } from "inversify";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import PluginsContext from "@floro/database/src/contexts/plugins/PluginsContext";
import PluginHelper from "@floro/database/src/contexts/utils/PluginHelper";
import { PLUGIN_REGEX } from "@floro/common-web/src/utils/validators";
import { Organization } from "@floro/database/src/entities/Organization";
import { User } from "@floro/database/src/entities/User";

export interface RegisterPluginReponse {
  action:
    | "PLUGIN_CREATED"
    | "PLUGIN_NAME_TAKEN_ERROR"
    | "PLUGIN_NAME_TAKEN_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "LOG_ERROR";
  plugin?: PluginHelper;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

@injectable()
export default class PluginRegistryService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
  }

  public async checkPluginNameIsTaken(pluginName: string): Promise<boolean> {
    const pluginsContext = await this.contextFactory.createContext(
      PluginsContext
    );
    const nameKey = PluginHelper.getPluginKeyUUID(pluginName ?? "");
    if (!nameKey) {
      return false;
    }
    return await pluginsContext.pluginExistsByNameKey(nameKey);
  }

  public async registerPlugin(
    name: string,
    isPrivate: boolean,
    ownerType: "user_plugin" | "org_plugin",
    user: User,
    organization?: Organization
  ): Promise<RegisterPluginReponse> {
    if (!PLUGIN_REGEX.test(name)) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Invalid plugin name",
        },
      };
    }

    const nameKey = PluginHelper.getPluginKeyUUID(name);
    if (!nameKey) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Invalid plugin name",
        },
      };
    }
    const sanitizedName = PluginHelper.sanitizePluginName(name);
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const pluginsContext = await this.contextFactory.createContext(
        PluginsContext,
        queryRunner
      );
      const pluginNameExists = await pluginsContext.pluginExistsByNameKey(
        nameKey
      );
      if (pluginNameExists) {
        await queryRunner.rollbackTransaction();
        return {
          action: "PLUGIN_NAME_TAKEN_ERROR",
          error: {
            type: "PLUGIN_NAME_TAKEN_ERROR",
            message: "Plugin name already in use",
          },
        };
      }

      if (ownerType == "user_plugin") {
        const params = {
          name: sanitizedName,
          nameKey,
          ownerType,
          isPrivate,
          createdByUser: user,
          user,
        };
        const plugin = await pluginsContext.createPlugin(params);
        if (!plugin) {
          await queryRunner.rollbackTransaction();
          return {
            action: "LOG_ERROR",
            error: {
              type: "PLUGIN_NOT_CREATED",
              message: "Plugin not created",
            },
          };
        }
        await queryRunner.commitTransaction();
        return {
          action: "PLUGIN_CREATED",
          plugin,
        };
      }
      // add permissions logic here
      const params = {
        name: sanitizedName,
        nameKey,
        ownerType,
        isPrivate,
        createdByUser: user,
        user,
        organization,
      };
      const plugin = await pluginsContext.createPlugin(params);
      if (!plugin) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "PLUGIN_NOT_CREATED",
            message: "Plugin not created",
          },
        };
      }
      await queryRunner.commitTransaction();
      return {
        action: "PLUGIN_CREATED",
        plugin,
      };
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
