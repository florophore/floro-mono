import { Manifest } from "floro/dist/src/plugins";
import PluginDefaultSelectedLight from "@floro/common-assets/assets/images/icons/plugin_default.selected.light.svg";
import PluginDefaultSelectedDark from "@floro/common-assets/assets/images/icons/plugin_default.selected.dark.svg";
import PluginDefaultLight from "@floro/common-assets/assets/images/icons/plugin_default.unselected.light.svg";
import PluginDefaultDark from "@floro/common-assets/assets/images/icons/plugin_default.unselected.dark.svg";
import {
  Plugin,
  PluginVersion,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import semver from "semver";

const createLocalUri = (
  pluginName: string,
  pluginVersion: string,
  iconPath: string
): string => {
  const basePath = `/plugins/${pluginName}/${pluginVersion}/floro`.split("/");
  const joinedPath = [...basePath, ...iconPath.split("/")].filter(
    (v) => v != "."
  );
  for (let i = 0; i < joinedPath.length; ++i) {
    if (joinedPath[i] == "..") {
      joinedPath.splice(i - 1, 2);
      i--;
    }
  }
  return `http://localhost:63403${joinedPath.join("/")}`;
};

export const getIcons = (
  pluginName: string,
  pluginVersion: string,
  manifest: Manifest
): {
  lightIcon: string;
  darkIcon: string;
  selectedLightIcon: string;
  selectedDarkIcon: string;
} => {
  try {
    if (typeof manifest.icon == "string") {
      return {
        lightIcon: createLocalUri(pluginName, pluginVersion, manifest.icon),
        darkIcon: createLocalUri(pluginName, pluginVersion, manifest.icon),
        selectedLightIcon: createLocalUri(
          pluginName,
          pluginVersion,
          manifest.icon
        ),
        selectedDarkIcon: createLocalUri(
          pluginName,
          pluginVersion,
          manifest.icon
        ),
      };
    }

    if (!manifest.icon.selected) {
      return {
        lightIcon: manifest.icon.light
          ? createLocalUri(pluginName, pluginVersion, manifest.icon.light)
          : PluginDefaultLight,
        darkIcon: manifest.icon.dark
          ? createLocalUri(pluginName, pluginVersion, manifest.icon.dark)
          : PluginDefaultDark,
        selectedLightIcon: manifest.icon.light
          ? createLocalUri(pluginName, pluginVersion, manifest.icon.light)
          : PluginDefaultSelectedLight,
        selectedDarkIcon: manifest.icon.dark
          ? createLocalUri(pluginName, pluginVersion, manifest.icon.dark)
          : PluginDefaultSelectedDark,
      };
    }

    if (typeof manifest.icon.selected == "string") {
      return {
        lightIcon: manifest.icon.light
          ? createLocalUri(pluginName, pluginVersion, manifest.icon.light)
          : PluginDefaultLight,
        darkIcon: manifest.icon.dark
          ? createLocalUri(pluginName, pluginVersion, manifest.icon.dark)
          : PluginDefaultDark,
        selectedLightIcon: manifest.icon.selected
          ? createLocalUri(pluginName, pluginVersion, manifest.icon.selected)
          : PluginDefaultSelectedLight,
        selectedDarkIcon: manifest.icon.selected
          ? createLocalUri(pluginName, pluginVersion, manifest.icon.selected)
          : PluginDefaultSelectedDark,
      };
    }

    return {
      lightIcon: manifest.icon.light
        ? createLocalUri(pluginName, pluginVersion, manifest.icon.light)
        : PluginDefaultLight,
      darkIcon: manifest.icon.dark
        ? createLocalUri(pluginName, pluginVersion, manifest.icon.dark)
        : PluginDefaultDark,
      selectedLightIcon: manifest.icon.selected.light
        ? createLocalUri(
            pluginName,
            pluginVersion,
            manifest.icon.selected.light
          )
        : PluginDefaultSelectedLight,
      selectedDarkIcon: manifest.icon.selected.dark
        ? createLocalUri(pluginName, pluginVersion, manifest.icon.selected.dark)
        : PluginDefaultSelectedDark,
    };
  } catch (e) {
    return {
      lightIcon: PluginDefaultLight,
      darkIcon: PluginDefaultDark,
      selectedLightIcon: PluginDefaultSelectedLight,
      selectedDarkIcon: PluginDefaultSelectedDark,
    };
  }
};

const createPartialPluginVersionFromManifest = (
  pluginName: string,
  pluginVersion: string,
  manifest: Manifest,
  manifestList: Array<Manifest>
): PluginVersion => {
  const icons = getIcons(pluginName, pluginVersion, manifest);
  const optimisticPluginVersion: PluginVersion = {
    __typename: "PluginVersion",
    name: manifest.name,
    version: manifest.version,
    managedCopy: !!manifest?.managedCopy,
    displayName: manifest.displayName,
    description: manifest.description,
    codeDocsUrl: manifest?.codeDocsUrl,
    codeRepoUrl: manifest?.codeRepoUrl,
    lightIcon: icons.lightIcon,
    darkIcon: icons.darkIcon,
    selectedLightIcon: icons.selectedLightIcon,
    selectedDarkIcon: icons.selectedDarkIcon,
    manifest: JSON.stringify(manifest)
  };
  const pluginDependencies: Array<PluginVersion> = [];
  for (const pluginName in manifest.imports) {
    const pluginVersion = manifest.imports[pluginName];
    const dependencyManifest = manifestList?.find(
      (manifest) =>
        manifest.name == pluginName && manifest.version == pluginVersion
    ) as Manifest;
    if (!dependencyManifest) {
      continue;
    }
    const dependencyVersion: PluginVersion =
      createPartialPluginVersionFromManifest(
        dependencyManifest.name,
        dependencyManifest.version,
        dependencyManifest,
        manifestList
      );
    pluginDependencies.push(dependencyVersion);
  }
  optimisticPluginVersion.pluginDependencies = pluginDependencies;
  return optimisticPluginVersion;
};

export const sortPluginVersions = (
  pluginVersions: Array<PluginVersion>
): Array<PluginVersion> => {
  return pluginVersions.sort((a, b) => {
    if (a.version == "dev") {
      return -1;
    }
    if (b.version == "dev") {
      return 1;
    }
    if (a?.version?.startsWith("dev@") && b?.version?.startsWith("dev@")) {
      const [, aVer] = a.version.split("@");
      const [, bVer] = b.version.split("@");
      if (semver.eq(aVer as string, bVer as string)) {
        return 0;
      }
      return semver.gt(aVer as string, bVer as string) ? -1 : 1;
    }

    if (a?.version?.startsWith("dev@")) {
      const [, aVer] = a.version.split("@");
      if (semver.eq(aVer as string, b.version as string)) {
        return -1;
      }
      return semver.gt(aVer as string, b.version as string) ? -1 : 1;
    }
    if (b?.version?.startsWith("dev@")) {
      const [, bVer] = b.version.split("@");
      if (semver.eq(a.version as string, bVer as string)) {
        return 1;
      }
      return semver.gt(a.version as string, bVer as string) ? -1 : 1;
    }
    if (semver.eq(a.version as string, b.version as string)) {
      return 0;
    }
    return semver.gt(a.version as string, b.version as string) ? -1 : 1;
  });
};

export const transformLocalManifestToPartialPlugin = (
  pluginName: string,
  pluginVersion: string,
  manifest: Manifest,
  manifestList: Array<Manifest>
): Plugin => {
  const optimisticPluginVersion = createPartialPluginVersionFromManifest(
    pluginName,
    pluginVersion,
    manifest,
    manifestList
  );

  const versions: Array<PluginVersion> = sortPluginVersions(
    manifestList
      ?.filter?.((versionManifest) => {
        return versionManifest.name == manifest.name;
      })
      ?.map?.((versionManifest): PluginVersion => {
        return createPartialPluginVersionFromManifest(
          versionManifest.name,
          versionManifest.version,
          versionManifest,
          manifestList
        );
      }) ?? []
  );

  const optimisticPlugin: Plugin = {
    __typename: "Plugin",
    name: manifest.name,
    displayName: manifest.displayName,
    lightIcon: optimisticPluginVersion.lightIcon,
    darkIcon: optimisticPluginVersion.darkIcon,
    selectedLightIcon: optimisticPluginVersion.selectedLightIcon,
    selectedDarkIcon: optimisticPluginVersion.selectedDarkIcon,
    versions: versions,
  };
  return optimisticPlugin;
};