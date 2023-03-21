import React, { useState, useCallback, useEffect, useMemo } from "react";
import FindPluginModal from "@floro/storybook/stories/common-components/FindPluginModal";
import {
  Plugin,
  PluginVersion,
  Repository,
  useSearchPluginsForRepositoryLazyQuery,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import debouncer from "lodash.debounce";
import { ApiReponse } from "@floro/floro-lib/src/repo";
import PluginInstaller from "./PluginInstaller";
import { Manifest } from "@floro/floro-lib/src/plugins";
import PluginSearchSplashScreen from "./PluginSearchSplashScreen";

export interface Props {
  onDismiss: () => void;
  show: boolean;
  apiReponse: ApiReponse;
  repository: Repository;
  repoManifestList: Array<Manifest>;
  onChangePluginVersion: (plugin?: Plugin, pluginVersion?: PluginVersion) => void;
  selectedPlugin?: Plugin;
  selectedPluginVersion?: PluginVersion;
  developerPlugin: Array<Plugin>;
  suggestedPlugin: Array<Plugin>;
}

const AddPluginsModal = (props: Props) => {
  const [query, setSearchQuery] = useState("");
  const [searchPlugins, { data, loading }] =
    useSearchPluginsForRepositoryLazyQuery({
      fetchPolicy: "network-only",
    });

  const searchDebounced = useCallback(debouncer(searchPlugins, 500), [
    searchPlugins,
  ]);

  const onSelectPluginFromSearch = useCallback((plugin: Plugin) => {
    if (plugin.isPrivate) {
      props.onChangePluginVersion(
        plugin,
        (plugin.versions ?? []).find(
          (pv) => pv?.id == plugin?.lastReleasedPrivateVersion?.id
        ) ?? (plugin.versions?.[0] as PluginVersion)
      );
    } else {
      props.onChangePluginVersion(
        plugin,
        (plugin.versions ?? []).find(
          (pv) => pv?.id == plugin?.lastReleasedPublicVersion?.id
        ) ?? (plugin.versions?.[0] as PluginVersion)
      );
    }
  }, [props.onChangePluginVersion]);

  useEffect(() => {
    searchDebounced({
      variables: {
        query,
        repositoryId: props.repository.id,
      },
    });
  }, [query, searchDebounced, props.repository]);

  useEffect(() => {
    if (!props.show) {
      props.onChangePluginVersion(undefined, undefined)
      setSearchQuery("");
    }
  }, [props.show, props.onChangePluginVersion]);

  return (
    <FindPluginModal
      show={props.show}
      onDismiss={props.onDismiss}
      query={query}
      onUpdateQueryText={setSearchQuery}
      isLoading={loading}
      pluginResults={
        (data?.searchPluginsForRepository?.plugins ?? []) as Array<Plugin>
      }
      onSelectPlugin={onSelectPluginFromSearch}
      plugin={props.selectedPlugin}
    >
      <>
        {props.selectedPlugin && props.selectedPluginVersion && (
          <PluginInstaller
            plugin={props.selectedPlugin}
            repository={props.repository}
            apiReponse={props.apiReponse}
            onDismiss={props.onDismiss}
            pluginVersion={props.selectedPluginVersion}
            onChangePluginVersion={props.onChangePluginVersion}
            repoManifestList={props.repoManifestList}
            developerPlugins={props.developerPlugin}
          />
        )}
        {!props.selectedPlugin && (
          <PluginSearchSplashScreen
            apiReponse={props.apiReponse}
            onChangePluginVersion={props.onChangePluginVersion}
            developerPlugins={props.developerPlugin}
            suggestedPlugins={props.suggestedPlugin}
          />
        )}
      </>
    </FindPluginModal>
  );
};

export default React.memo(AddPluginsModal);
