import { injectable, inject } from "inversify";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import PluginsContext from "@floro/database/src/contexts/plugins/PluginsContext";
import PluginVersionsContext from "@floro/database/src/contexts/plugins/PluginVersionsContext";
import PluginVersionDependenciesContext from "@floro/database/src/contexts/plugins/PluginVersionDependenciesContext";
import PluginHelper from "@floro/database/src/contexts/utils/PluginHelper";
import { PLUGIN_REGEX } from "@floro/common-web/src/utils/validators";
import { Organization } from "@floro/database/src/entities/Organization";
import { User } from "@floro/database/src/entities/User";
import { Plugin } from "@floro/database/src/entities/Plugin";
import { PluginVersion } from "@floro/database/src/entities/PluginVersion";
import { Manifest,
  coalesceDependencyVersions,
  getUpstreamDependencyManifests,
  pluginManifestsAreCompatibleForUpdate,
  validatePluginManifest,
} from "floro/dist/src/plugins";
import { makeMemoizedDataSource, makeDataSource } from "floro/dist/src/datasource";
import { PluginUploadStream } from "./instances/PluginUploadStream";
import semver from "semver";
import PluginTarAccessor from "@floro/storage/src/accessors/PluginTarAccessor";
import MainConfig from "@floro/config/src/MainConfig";
import PluginAccessor from "@floro/storage/src/accessors/PluginAccessor";

export interface RegisterPluginReponse {
  action:
    | "PLUGIN_CREATED"
    | "PLUGIN_NAME_TAKEN_ERROR"
    | "PLUGIN_NAME_TAKEN_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "LOG_ERROR";
  plugin?: Plugin;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface UploadPluginReponse {
  action:
    | "PLUGIN_VERSION_CREATED"
    | "PLUGIN_MANIFEST_INVALID"
    | "PLUGIN_NAME_TAKEN_ERROR"
    | "DEPENDENCY_PERMISSION_ERROR"
    | "MANIFEST_DEPENDENCY_ERROR"
    | "PLUGIN_COMPATABILITY_ERROR"
    | "BAD_VERSION_ERROR"
    | "LOG_ERROR";
  pluginVersion?: PluginVersion;
  plugin?: Plugin;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface ReleasePluginReponse {
  action:
    | "PLUGIN_VERSION_RELEASED"
    | "FORBIDDEN_ACTION_ERROR"
    | "ILLEGAL_STATE_ERROR"
    | "CONCURRENCY_ERROR"
    | "NOT_FOUND_ERROR"
    | "BAD_VERSION_ERROR"
    | "LOG_ERROR";
  pluginVersion?: PluginVersion;
  plugin?: Plugin;
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
  private pluginTarAccessor!: PluginTarAccessor;
  private pluginAccessor!: PluginAccessor;
  private config!: MainConfig;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(PluginTarAccessor) pluginTarAccessor: PluginTarAccessor,
    @inject(PluginAccessor) pluginAccessor: PluginAccessor,
    @inject(MainConfig) config: MainConfig
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.pluginTarAccessor = pluginTarAccessor;
    this.pluginAccessor = pluginAccessor;
    this.config = config;
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
    if (!PLUGIN_REGEX.test(name) || name.toLowerCase().trim() == "home") {
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
          type: "UNKNOWN_REGISTER_PLUGIN_ERROR",
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

  public async writePluginVersion(
    plugin: Plugin,
    pluginUploadStream: PluginUploadStream,
    currentUser: User,
    organization?: Organization
  ): Promise<UploadPluginReponse> {
    try {
      const pluginVersionsContext = await this.contextFactory.createContext(
        PluginVersionsContext
      );
      //const pluginFetch = this.makePluginFetch(pluginVersionsContext);
      const datasource = this.makeMemoizedDatasource(pluginVersionsContext);
      const existingVersions = await pluginVersionsContext.getByPlugin(
        plugin.id
      );
      const pluginIsValid = await validatePluginManifest(
        datasource,
        pluginUploadStream.originalManifest as Manifest,
      );
      if (pluginIsValid.status == "error") {
        return {
          action: "PLUGIN_MANIFEST_INVALID",
          error: {
            type: "PLUGIN_MANIFEST_INVALID",
            message: pluginIsValid.message as string,
          },
        };
      }
      const dependencyManifests = await getUpstreamDependencyManifests(
        datasource,
        pluginUploadStream.originalManifest as Manifest,
        true
      );
      if (!dependencyManifests) {
        return {
          action: "MANIFEST_DEPENDENCY_ERROR",
          error: {
            type: "MANIFEST_DEPENDENCY_ERROR",
            message: "Unable to locate upstream dependencies.",
          },
        };
      }

      const depsMap = coalesceDependencyVersions(dependencyManifests);
      const dependenciesPluginVersions: PluginVersion[] = [];

      if (depsMap) {
        delete depsMap[pluginUploadStream.name as string];
      }

      for (const pluginName in depsMap) {
        const maxVersion = depsMap[pluginName][depsMap[pluginName].length - 1];
        const pluginVersion = await pluginVersionsContext.getByNameAndVersion(
          pluginName,
          maxVersion
        );
        if (!pluginVersion) {
          return {
            action: "MANIFEST_DEPENDENCY_ERROR",
            error: {
              type: "MANIFEST_DEPENDENCY_ERROR",
              message: "Unable to locate upstream dependencies.",
            },
          };
        }
        if (pluginVersion.state != "released") {
          return {
            action: "MANIFEST_DEPENDENCY_ERROR",
            error: {
              type: "MANIFEST_DEPENDENCY_ERROR",
              message: `Cannot depend on unreleased plugins. Remove ${pluginVersion.name}@${pluginVersion.version}`,
            },
          };
        }
        if (pluginVersion.isPrivate) {
          if (
            pluginVersion.ownerType == "org_plugin" &&
            (!plugin.isPrivate ||
              plugin.ownerType != "org_plugin" ||
              !plugin.organizationId ||
              !pluginVersion.organizationId ||
              plugin.organizationId != pluginVersion.organizationId)
          ) {
            return {
              action: "DEPENDENCY_PERMISSION_ERROR",
              error: {
                type: "DEPENDENCY_PERMISSION_ERROR",
                message:
                  "Unable to depend on " +
                  pluginVersion.name +
                  ". Invalid plugin visability.",
              },
            };
          }

          if (
            pluginVersion.ownerType == "user_plugin" &&
            (!plugin.isPrivate ||
              plugin.ownerType != "user_plugin" ||
              !plugin.userId ||
              !pluginVersion.userId ||
              plugin.userId != pluginVersion.userId)
          ) {
            return {
              action: "DEPENDENCY_PERMISSION_ERROR",
              error: {
                type: "DEPENDENCY_PERMISSION_ERROR",
                message:
                  "Unable to depend on " +
                  pluginVersion.name +
                  ". Invalid plugin visability.",
              },
            };
          }
        }
        dependenciesPluginVersions.push(pluginVersion);
      }

      const lastVersion = existingVersions[existingVersions.length - 1];

      if (
        lastVersion &&
        !semver.gt(pluginUploadStream.version as string, lastVersion.version)
      ) {
        return {
          action: "BAD_VERSION_ERROR",
          error: {
            type: "BAD_VERSION_ERROR",
            message: `Version should be greater than last verion ${lastVersion.version}. Please upload again with a higher version number.`,
          },
        };
      }

      const lastReleaseVersion = this.getLastReleasedVersion(existingVersions);
      const lastReleaseVersionNumber = lastReleaseVersion
        ? lastReleaseVersion.version
        : undefined;
      let isCompatible: boolean | null = true;
      if (lastReleaseVersion) {
        if (
          !semver.gt(
            pluginUploadStream.version as string,
            lastReleaseVersion?.version as string
          )
        ) {
          return {
            action: "BAD_VERSION_ERROR",
            error: {
              type: "BAD_VERSION_ERROR",
              message: `Version should be greater than last verion ${lastReleaseVersion.version}. Got ${pluginUploadStream.version}`,
            },
          };
        }
        const lastManifest: Manifest = JSON.parse(lastReleaseVersion.manifest);
        isCompatible = await pluginManifestsAreCompatibleForUpdate(
          datasource,
          lastManifest,
          pluginUploadStream.originalManifest as Manifest,
        );
        if (isCompatible === null) {
          return {
            action: "PLUGIN_COMPATABILITY_ERROR",
            error: {
              type: "PLUGIN_COMPATABILITY_ERROR",
              message: "Unknown error checking compatability. Try again.",
            },
          };
        }
      }
      const didWriteTar = await this.pluginTarAccessor.writeTar(
        pluginUploadStream.uuid,
        pluginUploadStream.getReadStream()
      );
      if (!didWriteTar) {
        return {
          action: "LOG_ERROR",
          error: {
            type: "BAD_TAR_ERROR",
            message: "Failed to write plugin tar.",
          },
        };
      }
      const publicCdnUrl = this.config.publicRoot();
      const writeImports = dependenciesPluginVersions.reduce(
        (acc, pluginVersion) => {
          return {
            ...acc,
            [pluginVersion.name]: pluginVersion.version,
          };
        },
        {}
      );
      const writeManifest = {
        ...pluginUploadStream.originalManifest,
        managedCopy: pluginUploadStream.managedCopy,
        imports: writeImports,
        icon: {
          light: `${publicCdnUrl}/plugins/${pluginUploadStream.uuid}/floro/${pluginUploadStream.lightIconPath}`,
          dark: `${publicCdnUrl}/plugins/${pluginUploadStream.uuid}/floro/${pluginUploadStream.darkIconPath}`,
          selected: {
            light: `${publicCdnUrl}/plugins/${pluginUploadStream.uuid}/floro/${pluginUploadStream.selectedLightIconPath}`,
            dark: `${publicCdnUrl}/plugins/${pluginUploadStream.uuid}/floro/${pluginUploadStream.selectedDarkIconPath}`,
          }
        },
      };
      const files: { [key: string]: string | Buffer | undefined } = {
        ["floro/floro.manifest.json"]: JSON.stringify(writeManifest, null, 2),
        ["floro/" + pluginUploadStream.darkIconPath]:
          pluginUploadStream.originalDarkIcon,
        ["floro/" + pluginUploadStream.lightIconPath]:
          pluginUploadStream.originalLightIcon,
        ["floro/" + pluginUploadStream.selectedLightIconPath]:
          pluginUploadStream.originalSelectedLightIcon,
        ["floro/" + pluginUploadStream.selectedDarkIconPath]:
          pluginUploadStream.originalSelectedDarkIcon,
        ["index.html"]: pluginUploadStream.originalIndexHTML,
        [pluginUploadStream.indexJSPath as string]:
          pluginUploadStream.originalIndexJS,
        ...pluginUploadStream.originalAssets,
      };
      for (const fname in files) {
        const content = files[fname];
        if (typeof content == "string") {
          files[fname] = content
            .replaceAll?.("http://localhost:63403", publicCdnUrl)
            ?.replaceAll(
              `${publicCdnUrl}/plugins/${pluginUploadStream?.name}/${pluginUploadStream?.version}/`,
              `${publicCdnUrl}/plugins/${pluginUploadStream.uuid}/`
            );
        }
      }
      const didUpload = await this.pluginAccessor.writePluginFiles(
        pluginUploadStream.uuid,
        files
      );
      if (!didUpload) {
        return {
          action: "LOG_ERROR",
          error: {
            type: "BAD_FILE_ERROR",
            message: "Failed to upload plugin files to public cdn.",
          },
        };
      }
      const unreleasedVersions = this.getUnReleasedVersions(existingVersions);
      const lastUnreleasedVersion =
        unreleasedVersions?.[unreleasedVersions.length - 1];
      if (
        lastUnreleasedVersion &&
        !semver.gt(
          pluginUploadStream.version as string,
          lastUnreleasedVersion?.version as string
        )
      ) {
        return {
          action: "BAD_VERSION_ERROR",
          error: {
            type: "BAD_VERSION_ERROR",
            message: `Version should be greater than last verion ${lastUnreleasedVersion.version}. Please update your version number and upload again.`,
          },
        };
      }
      const queryRunner = await this.databaseConnection.makeQueryRunner();
      try {
        await queryRunner.startTransaction();
        const pluginVersionTXContext = await this.contextFactory.createContext(
          PluginVersionsContext,
          queryRunner
        );
        const pluginTXContext = await this.contextFactory.createContext(
          PluginsContext,
          queryRunner
        );
        const pluginVersionDepsTXContext =
          await this.contextFactory.createContext(
            PluginVersionDependenciesContext,
            queryRunner
          );
        const pluginVersion = await pluginVersionTXContext.createPluginVersion({
          name: pluginUploadStream.name,
          uploadHash: pluginUploadStream.uuid,
          ownerType: plugin.ownerType,
          version: pluginUploadStream?.version ?? "",
          nameKey: plugin.nameKey,
          state: "unreleased",
          isPrivate: plugin.isPrivate,
          isBackwardsCompatible: isCompatible,
          previousReleaseVersion: lastReleaseVersionNumber,
          manifest: JSON.stringify(writeManifest, null, 2),
          codeRepoUrl: pluginUploadStream.originalManifest?.codeRepoUrl,
          codeDocsUrl: pluginUploadStream.originalManifest?.codeDocsUrl,
          description: pluginUploadStream.description,
          displayName: pluginUploadStream.displayName,
          managedCopy: pluginUploadStream.managedCopy,
          lightIcon: writeManifest.icon.light,
          darkIcon: writeManifest.icon.dark,
          selectedLightIcon: writeManifest.icon.selected.light,
          selectedDarkIcon: writeManifest.icon.selected.dark,
          indexHtml: files?.["index.html"] as string,
          pluginId: plugin.id,
          uploadedByUserId: currentUser.id,
          organizationId: organization?.id,
          userId: plugin.ownerType == "user_plugin" ? currentUser?.id : undefined
        });

        for (const dep of dependenciesPluginVersions) {
          await pluginVersionDepsTXContext.createPluginVersionDependency({
            isPrimaryDependency:
              !!pluginUploadStream?.originalManifest?.[dep.name],
            pluginUploadHash: pluginUploadStream.uuid,
            name: plugin.name,
            nameKey: plugin.nameKey,
            version: pluginVersion.version,
            dependencyName: dep.name,
            dependencyVersion: dep.version,
            dependencyNameKey: dep.nameKey,
            pluginId: plugin.id,
            plugin,
            pluginVersionId: pluginVersion.id,
            pluginVersion,
            dependencyPluginId: dep.pluginId,
            dependencyPluginVersionId: dep.id,
          });
        }
        const updatedPlugin = await pluginTXContext.getById(plugin.id);
        await queryRunner.commitTransaction();
        return {
          action: "PLUGIN_VERSION_CREATED",
          pluginVersion,
          plugin: updatedPlugin as Plugin
        };
      } catch (e: any) {
        if (!queryRunner.isReleased) {
          await queryRunner.rollbackTransaction();
        }
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_UPLOAD_PLUGIN_VERSION_ERROR",
            message: e?.message,
            meta: e,
          },
        };
      } finally {
        if (!queryRunner.isReleased) {
          await queryRunner.release();
        }
      }
    } catch (e: any) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_UPLOAD_PLUGIN_VERSION_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      pluginUploadStream.release();
    }
  }

  private getLastReleasedVersion(
    existingVersions: PluginVersion[]
  ): PluginVersion | null {
    const releasedVersions = existingVersions
      .filter((version) => {
        return version.state == "released";
      })
      .sort((a: PluginVersion, b: PluginVersion) => {
        if (semver.eq(a.version, b.version)) {
          return 0;
        }
        return semver.gt(a.version, b.version) ? 1 : -1;
      });
    if (releasedVersions.length > 0) {
      return releasedVersions[releasedVersions.length - 1];
    }

    return null;
  }

  private getUnReleasedVersions(
    existingVersions: PluginVersion[]
  ): PluginVersion[] {
    return existingVersions
      .filter((version) => {
        return version.state == "unreleased";
      })
      .sort((a: PluginVersion, b: PluginVersion) => {
        if (semver.eq(a.version, b.version)) {
          return 0;
        }
        return semver.gt(a.version, b.version) ? 1 : -1;
      });
  }

  private makeMemoizedDatasource = (pluginVersionsContext: PluginVersionsContext) => {
    const datasource = makeDataSource({
      getPluginManifest: async (name: string, version: string): Promise<Manifest> => {
        const pluginVersion = await pluginVersionsContext.getByNameAndVersion(
          name,
          version
        );
        if (!pluginVersion) {
          throw new Error("missing manifest");
        }
        const manifest: Manifest = JSON.parse(pluginVersion.manifest);
        return manifest;
      }
    });
    return makeMemoizedDataSource(datasource);
  }

  public async releasePlugin(
    pluginVersionId: string,
    currentUser: User,
    organization?: Organization
  ): Promise<ReleasePluginReponse> {
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const pluginContext = await this.contextFactory.createContext(
        PluginsContext,
        queryRunner
      );
      const pluginVersionContext = await this.contextFactory.createContext(
        PluginVersionsContext,
        queryRunner
      );
      const pluginVersion = await pluginVersionContext.getById(pluginVersionId);
      if (!pluginVersion) {
        // ADD ERROR
        await queryRunner.rollbackTransaction();
        return {
          action: "NOT_FOUND_ERROR",
          error: {
            type: "NOT_FOUND_ERROR",
            message: "Plugin Version not found",
          },
        };
      }
      const plugin = await pluginContext.getById(pluginVersion.pluginId);
      const existingVersions = await pluginVersionContext.getByPlugin(
        pluginVersion.pluginId
      );
      const existingVersionsExcludingVersion = existingVersions.filter(
        (v) => v.id != pluginVersionId
      );
      const lastVersion =
        existingVersionsExcludingVersion[
          existingVersionsExcludingVersion.length - 1
        ];
      if (
        lastVersion &&
        !semver.gt(pluginVersion.version, lastVersion.version)
      ) {
        await queryRunner.rollbackTransaction();
        return {
          action: "BAD_VERSION_ERROR",
          error: {
            type: "BAD_VERSION_ERROR",
            message: `Version should be greater than last verion ${lastVersion.version}. You can only release the lastest version.`,
          },
        };
      }

      if (!plugin) {
        await queryRunner.rollbackTransaction();
        return {
          action: "NOT_FOUND_ERROR",
          error: {
            type: "NOT_FOUND_ERROR",
            message: "Plugin not found",
          },
        };
      }

      if (
        pluginVersion.ownerType == "user_plugin" &&
        pluginVersion.userId != currentUser.id
      ) {
        await queryRunner.rollbackTransaction();
        return {
          action: "FORBIDDEN_ACTION_ERROR",
          error: {
            type: "FORBIDDEN_ACTION_ERROR",
            message: "Forbidden Action",
          },
        };
      }
      if (
        pluginVersion.ownerType == "org_plugin" &&
        (!organization?.id || pluginVersion.organizationId != organization?.id)
      ) {
        await queryRunner.rollbackTransaction();
        return {
          action: "FORBIDDEN_ACTION_ERROR",
          error: {
            type: "FORBIDDEN_ACTION_ERROR",
            message: "Forbidden Action",
          },
        };
      }

      if (pluginVersion.state != "unreleased") {
        await queryRunner.rollbackTransaction();
        return {
          action: "ILLEGAL_STATE_ERROR",
          error: {
            type: "ILLEGAL_STATE_ERROR",
            message: "Cannot release unreleased or cancelled plugin.",
          },
        };
      }
      const updatedPluginVersion =
        await pluginVersionContext.updatePluginVersion(pluginVersion, {
          state: "released",
        });
      let updatedPlugin: Plugin;
      if (plugin.isPrivate) {
        updatedPlugin = await pluginContext.updatePlugin(plugin, {
          lastReleasedPrivatePluginVersionId: updatedPluginVersion.id,
          lastReleasedPrivatePluginVersion: updatedPluginVersion
        })
      } else {
        updatedPlugin = await pluginContext.updatePlugin(plugin, {
          lastReleasedPublicPluginVersionId: updatedPluginVersion.id,
          lastReleasedPublicPluginVersion: updatedPluginVersion
        })
      }
      const returnPlugin = await pluginContext.getById(updatedPlugin.id);
      if (!returnPlugin) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_PLUGIN_RELEASE_ERROR",
            message: "Unknown error"
          },
        };
      }
      await queryRunner.commitTransaction();
      return {
        action: "PLUGIN_VERSION_RELEASED",
        pluginVersion: updatedPluginVersion,
        plugin: returnPlugin
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_PLUGIN_RELEASE_ERROR",
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
