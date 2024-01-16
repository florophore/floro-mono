import React, { useMemo, useCallback, useEffect } from "react";
import styled from "@emotion/styled";
import { ApiResponse, RenderedApplicationState, RepoInfo } from "floro/dist/src/repo";
import { PluginVersion, Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useCurrentRepoState, usePaste, useRepoDevPlugins, useRepoManifestList } from "../../local/hooks/local-hooks";
import { useTheme } from "@emotion/react";
import { Link, useNavigate } from "react-router-dom";

import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";
import { useCopyPasteContext } from "../CopyPasteContext";
import CopyPasteRow from "./CopyPasteRow";
import Button from "@floro/storybook/stories/design-system/Button";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import { Manifest } from "floro/dist/src/plugins";
import { manifestListToSchemaMap} from "../../remote/hooks/polyfill-floro";
import { transformLocalManifestToPartialPlugin } from "../../local/hooks/manifest-transforms";

const TopContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const BottomContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 24px;
`;


const SectionContainer = styled.div`
  width: 100%;
`;

const SectionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const DependencyBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
  max-height: 440px;
  overflow: scroll;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const UnReleasedText = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
  margin-top: 4px;
  padding: 0;
`;

const RepoRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const GoBackIcon = styled.img`
  margin-top: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  margin-right: 16px;
`;

const RepoText = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  margin-top: 4px;
  padding: 0;
`;

const WarningContainer = styled.div`
    height: 72px;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

const ButtonContainer = styled.div`
    height: 48px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
`;

const useIntoApiReponsePlugins = (repoInfo: RepoInfo, apiResponse: ApiResponse|undefined|null): Array<PluginVersion> => {
  const repoManifestList = useRepoManifestList(repoInfo, apiResponse);
  const devPluginsRequest = useRepoDevPlugins(repoInfo);

  const apiManifestList = useMemo(() => {
    return repoManifestList?.data ?? [];
  }, [
    apiResponse?.applicationState,
    repoManifestList
  ]);

  const manifestList = useMemo(() => {
    const devManifestList: Array<Manifest> = [];
    for (const pluginName in devPluginsRequest?.data ?? {}) {
      const versions = devPluginsRequest?.data?.[pluginName] ?? {};
      for (const version in versions) {
        if (versions?.[version]?.manifest) {
          devManifestList.push(versions?.[version]?.manifest);
        }
      }
    }
    return [...(apiManifestList ?? []), ...devManifestList];
  }, [apiManifestList, devPluginsRequest]);


  const plugins = useMemo(() => {
    return apiResponse?.applicationState?.plugins ?? [];
  }, [
    apiResponse?.applicationState?.plugins,
  ]);

  return useMemo(() => {
    if (!manifestList || !apiResponse) {
      return [];
    }
    return plugins
      .map((pluginKV) => {
        const manifest = manifestList.find(
          (v) => v.name == pluginKV.key && v.version == pluginKV.value
        );
        if (!manifest) {
          return null;
        }
        return transformLocalManifestToPartialPlugin(
          pluginKV.key,
          pluginKV.value,
          manifest as Manifest,
          manifestList
        );
      })
      ?.filter((v) => v?.versions?.[0] != null)?.map(p => p?.versions?.[0] as PluginVersion) as Array<PluginVersion>;
  }, [manifestList, plugins]);
}

export interface Props {
  repoInfo: RepoInfo;
  fromRepository: Repository;
  pluginVersions: PluginVersion[];
  client: "local" | "remote";
  stateMap: RenderedApplicationState["store"];
}

const CopyPluginsContainer = (props: Props) => {
  const theme = useTheme();
  const { data: apiResponse } = useCurrentRepoState(props.repoInfo);
  const { setSelectedRepoInfo, copyInstructions, setIsSelectMode, setShowCopyPaste } = useCopyPasteContext(props.client);
  const navigate = useNavigate();


  const pasteMutation = usePaste(props.fromRepository, props.repoInfo);
  const canCopy = useMemo(() => {
    if (!apiResponse) {
      return false;
    }
    if (apiResponse?.repoState.commandMode == "compare") {
      return false;
    }
    if (apiResponse?.repoState.isInMergeConflict) {
      return false;
    }
    return true;
  }, [apiResponse]);

  const isWIP = useMemo(() => {
    return apiResponse?.isWIP ?? false;
  }, [apiResponse]);

  const repoLink = useMemo(() => {
    return `/repo/@/${props?.repoInfo?.ownerHandle}/${props?.repoInfo?.name}?from=local`;
  }, [props?.repoInfo?.ownerHandle, props?.repoInfo?.name]);


  const onGoBack = useCallback(() => {
    setSelectedRepoInfo(null);
  }, []);

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);

  const warningLabel = useMemo(() => {
    if (apiResponse?.repoState.isInMergeConflict) {
      return (
        <WarningLabel
          label={"Can't copy! Receiving repo is in a merge conflict."}
          size={"large"}
        />
      );
    }
    if (apiResponse?.repoState.commandMode == "compare") {
      return (
        <WarningLabel
          label={"Can't copy! Receiving repo is in comparison mode."}
          size={"large"}
        />
      );
    }
    if (isWIP) {
      return (
        <WarningLabel
          label={"Receiving repo is work in progress."}
          size={"large"}
        />
      );
    }
    return null;
  }, [
    isWIP,
    apiResponse?.repoState.commandMode,
    apiResponse?.repoState.isInMergeConflict,
    theme
  ]);

  const intoPluginVersions = useIntoApiReponsePlugins(props?.repoInfo, apiResponse);

  const canPerformCopy = useMemo(() => {
    if (Object.keys(copyInstructions).length == 0) {
      return false;
    }
    for (const pluginName in copyInstructions) {
      if (copyInstructions[pluginName]?.isManualCopy && copyInstructions[pluginName]?.manualCopyList.length == 0) {
        return false
      }
    }
    return true;
  }, [copyInstructions]);

  const canSelectReferences = useMemo(() => {
    for (const pluginName in copyInstructions) {
      if (copyInstructions[pluginName]?.isManualCopy) {
        return true;
      }
    }
    return false;
  }, [copyInstructions]);

  const onSelectMode = useCallback(() => {
    setIsSelectMode(true);
    setShowCopyPaste(false);
  }, []);

  const pluginsToAdd = useMemo(() => {
    const copyKeys = Object.keys(copyInstructions);
    const intoKeys = new Set(intoPluginVersions.map(p => p.name));
    const keysToAdd: Array<string> = [];
    for (const copyKey of copyKeys) {
      if (!intoKeys.has(copyKey)) {
        keysToAdd.push(copyKey);
      }
    }
    return keysToAdd.map(key => {
      const pluginVersion = props.pluginVersions.find(p => p.name == key) as PluginVersion;
      return {
        key,
        value: pluginVersion?.version
      } as {key: string, value: string}
    })

  }, [copyInstructions, intoPluginVersions, props.pluginVersions]);


  const fromSchemaMap = useMemo(() => {
    const manifestList = props.pluginVersions.map(
      (p) => JSON.parse(p?.manifest ?? "{}") as Manifest
    );
    return manifestListToSchemaMap(manifestList);
  }, [props.pluginVersions]);

  const onPaste = useCallback(() => {
    if (!canCopy || !canPerformCopy) {
      return;
    }
    pasteMutation.mutate({
      fromSchemaMap,
      fromStateMap: props.stateMap,
      copyInstructions,
      pluginsToAdd,
    });
  }, [
    props.stateMap,
    pluginsToAdd,
    fromSchemaMap,
    copyInstructions,
    pasteMutation,
    canCopy,
    canPerformCopy,
  ]);

  useEffect(() => {
    if (pasteMutation.isSuccess) {
      navigate(repoLink);
    }
  }, [pasteMutation, repoLink])
  return (
    <>
      <TopContentContainer>
        <SectionContainer>
          <TopRow>
            <div>
              <SectionTitle>{"Plugins"}</SectionTitle>
              <UnReleasedText>
                {"choose the plugins you would like to copy "} <i>{"into "}</i>
                <b>{props?.repoInfo.name}</b>
              </UnReleasedText>
              <RepoRow>
                <GoBackIcon onClick={onGoBack} src={backArrowIcon} />
                <RepoText>
                  <Link to={repoLink} style={{ color: theme.colors.linkColor }}>
                    <span>{"@" + props?.repoInfo.ownerHandle}</span>
                    <span style={{ paddingLeft: 4, paddingRight: 4 }}>
                      {"/"}
                    </span>
                    <span style={{ color: theme.colors.linkColor }}>
                      {props?.repoInfo.name}
                    </span>
                  </Link>
                </RepoText>
              </RepoRow>
            </div>
          </TopRow>
          <DependencyBox>
            {props?.pluginVersions.map((pluginVersion, index) => {
              return (
                <CopyPasteRow
                  isFirst={0 == index}
                  key={index}
                  isEven={index % 2 == 0}
                  pluginVersion={pluginVersion}
                  fromSchemaMap={fromSchemaMap}
                  fromPluginVersions={props?.pluginVersions}
                  intoPluginVersions={intoPluginVersions}
                  fromRepository={props.fromRepository}
                  intoRepoInfo={props.repoInfo}
                  client={props.client}
                />
              );
            })}
          </DependencyBox>
          <WarningContainer>
            {warningLabel}
          </WarningContainer>
        </SectionContainer>
      </TopContentContainer>
      <BottomContentContainer>
        <ButtonContainer>
            <Button onClick={onSelectMode} isDisabled={!canCopy || !canSelectReferences || pasteMutation.isLoading} label={"select references"} bg={"teal"} size={"medium"}/>
            <Button onClick={onPaste} isLoading={pasteMutation.isLoading} isDisabled={!canCopy || !canPerformCopy} label={"paste into"} bg={"purple"} size={"medium"}/>
        </ButtonContainer>
      </BottomContentContainer>
    </>
  );
};

export default React.memo(CopyPluginsContainer);
