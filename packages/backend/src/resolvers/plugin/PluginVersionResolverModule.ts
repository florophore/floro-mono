
import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import { PluginVersion } from "@floro/database/src/entities/PluginVersion";
import MainConfig from "@floro/config/src/MainConfig";

@injectable()
export default class PluginVersionResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "PluginVersion",
  ];

  private config!: MainConfig;

  constructor(
    @inject(MainConfig) config: MainConfig,
  ) {
    super();
    this.config = config;
  }

  public PluginVersion: main.PluginVersionResolvers = {
    entryUrl: (pluginVersion) => {
      return this.config.url() + `/plugins/${pluginVersion.name}/${pluginVersion.version}`;
    },
    pluginDependencies: (pluginVersion) => {
      const pv = pluginVersion as PluginVersion;
      const manifest = JSON.parse(pluginVersion.manifest as string);
      const manifestImports = manifest?.imports ?? {};
      const pvDependencies = pv.dependencies
        ?.flatMap((dep) => dep.dependencyPluginVersion)
        .reduce((acc, dep) => {
          if (!dep?.name) {
            return acc;
          }
          return {
            ...acc,
            [dep?.name]: dep,
          };
        }, {});
      const deps: PluginVersion[] = [];
      for (const pluginName in manifestImports) {
        if (pvDependencies?.[pluginName]) {
          deps.push(pvDependencies[pluginName] as PluginVersion);
        }
      }
      return deps;
    },
  };
}