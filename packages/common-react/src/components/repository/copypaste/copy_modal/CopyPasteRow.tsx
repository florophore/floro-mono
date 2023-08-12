import React, { useMemo, useCallback, useEffect } from "react";
import { PluginVersion } from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { RepoInfo } from "floro/dist/src/repo";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import DualToggle from "@floro/storybook/stories/design-system/DualToggle";
import ColorPalette from "@floro/styles/ColorPalette";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest, TypeStruct } from "floro/dist/src/plugins";
import {
  objectIsSubsetOfObject,
  manifestListToSchemaMap,
  getRootSchemaMap,
  DataSource
} from "../../remote/hooks/polyfill-floro";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import { useCopyPasteContext } from "../CopyPasteContext";
import { useQuery } from "react-query";

const TopContainer = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  border-radius: 8px;
`;

const Row = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  height: 72px;
  padding: 0 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RowWithoutHeight = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  padding: 0 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const PluginTitle = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.titleText};
  margin-left: 8px;
`;

const NameText = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.1rem;
  color: ${(props) => props.theme.colors.blurbText};
`;

const NoReferencesText = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  font-style: italic;
  color: ${(props) => props.theme.colors.warningTextColor};
`;

const Text = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.contrastText};
  margin-right: 16px;
`;

const Icon = styled.img`
  width: 56px;
  height: 56px;
`;

const CopyRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const UpsteamText= styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  font-style: italic;
  color: ${(props) => props.theme.colors.contrastText};
  margin-right: 16px;
`

const useRootSchema = (schemaMap: {[name: string]: Manifest}, pluginName: string, pluginVersion: string) => {
  const datasource: DataSource = {
    getPluginManifest: async (pluginName) => {
      return schemaMap[pluginName];
    },
  }
  return useQuery(
    "root-schema:" + pluginName + ":" + pluginVersion,
    async (): Promise<{
      [key: string]: TypeStruct;
    }|null> => {
      const result = await getRootSchemaMap(datasource, schemaMap, true);
      return result;
    },
    {
      cacheTime: 0,
    }
  );

}

export interface Props {
  fromRepository: Repository;
  intoRepoInfo: RepoInfo;
  pluginVersion: PluginVersion;
  fromPluginVersions: PluginVersion[];
  intoPluginVersions: PluginVersion[];
  fromSchemaMap: {[name: string]: Manifest};
  isEven: boolean;
  isFirst: boolean;
  client: "remote" | "local";
}

const LocalRepoRow = (props: Props) => {
  const theme = useTheme();
  const { setCopyInstructions, copyInstructions } = useCopyPasteContext(
    props.client
  );
  const backgroundColor = useMemo(() => {
    if (props.isEven) {
      return theme.colors.evenBackground;
    }
    return theme.colors.oddBackground;
  }, [theme, props.isEven]);
  const isPrivate = useMemo(() => {
    if (!props?.fromRepository?.isPrivate) {
      return false;
    }
    if (props?.fromRepository?.repoType == "user_repo") {
      return !!props?.fromRepository?.user?.privatePlugins?.find(
        (p) => p?.name == props?.pluginVersion.name
      );
    }
    return !!props?.fromRepository?.organization?.privatePlugins?.find(
      (p) => p?.name == props?.pluginVersion.name
    );
  }, [props?.fromRepository, props.pluginVersion]);

  const isPermitted = useMemo(() => {
    if (!isPrivate) {
      return true;
    }
    if (
      props?.fromRepository.repoType == "user_repo" &&
      props?.intoRepoInfo.repoType == "user_repo"
    ) {
      return props?.fromRepository.user?.id == props?.intoRepoInfo?.userId;
    }
    if (
      props?.fromRepository.repoType == "org_repo" &&
      props?.intoRepoInfo.repoType == "org_repo"
    ) {
      return (
        props?.fromRepository.organization?.id ==
        props?.intoRepoInfo?.organizationId
      );
    }
    return false;
  }, [
    props?.pluginVersion,
    props?.fromRepository,
    props?.intoRepoInfo,
    isPrivate,
  ]);
  const manifest = useMemo(() => {
    return JSON.parse(props?.pluginVersion?.manifest ?? "{}") as Manifest;
  }, [props?.pluginVersion?.manifest]);

  const isUpsteamInstruction = useMemo(() => {
    for (const pluginName in copyInstructions) {
      if (pluginName == manifest.name) {
        continue;
      }
      const imports = props.fromSchemaMap[pluginName].imports;
      if (imports[manifest.name]) {
        return true;
      }
    }
    return false;
  }, [copyInstructions, props.fromSchemaMap, manifest]);

  const intoManifest = useMemo(() => {
    const intoPluginVersion = props?.intoPluginVersions?.find(
      (p) => p.name == manifest.name
    );
    if (intoPluginVersion?.manifest) {
      return JSON.parse(intoPluginVersion?.manifest ?? "{}") as Manifest;
    }
    return manifest;
  }, [props?.pluginVersion?.manifest, manifest]);

  const fromPluginList = useMemo(() => {
    const pluginList: Array<PluginVersion> = [];
    pluginList.push(
      props?.fromPluginVersions?.find((p) => p.name == manifest.name) ??
        (props?.intoPluginVersions?.find(
          (p) => p.name == manifest.name
        ) as PluginVersion)
    );
    for (const pluginName in manifest.imports) {
      pluginList.push(
        props?.fromPluginVersions?.find((p) => p.name == pluginName) ??
          (props?.intoPluginVersions?.find(
            (p) => p.name == pluginName
          ) as PluginVersion)
      );
    }

    return pluginList;
  }, [manifest, props?.fromPluginVersions, props?.intoPluginVersions]);

  const intoPluginList = useMemo(() => {
    const pluginList: Array<PluginVersion> = [];
    pluginList.push(
      props?.intoPluginVersions?.find((p) => p.name == intoManifest.name) ??
        (props?.fromPluginVersions?.find(
          (p) => p.name == intoManifest.name
        ) as PluginVersion)
    );
    for (const pluginName in intoManifest.imports) {
      pluginList.push(
        props?.intoPluginVersions?.find((p) => p.name == pluginName) ??
          (props?.fromPluginVersions?.find(
            (p) => p.name == pluginName
          ) as PluginVersion)
      );
    }
    return pluginList;
  }, [intoManifest, props?.fromPluginVersions, props?.intoPluginVersions]);

  const fromSchemaMap = useMemo(() => {
    const manifestList = fromPluginList.map(
      (p) => JSON.parse(p?.manifest ?? "{}") as Manifest
    );
    return manifestListToSchemaMap(manifestList);
  }, [fromPluginList]);

  const intoSchemaMap = useMemo(() => {
    const manifestList = intoPluginList.map(
      (p) => JSON.parse(p?.manifest ?? "{}") as Manifest
    );
    return manifestListToSchemaMap(manifestList);
  }, [intoPluginList]);

  const { data: fromRootSchema} = useRootSchema(fromSchemaMap, manifest.name, manifest.version);
  const { data: intoRootSchema} = useRootSchema(intoSchemaMap, intoManifest.name, intoManifest.version);

  const isCompatible = useMemo(() => {
    if (!fromRootSchema || !intoRootSchema) {
      return false;
    }
    return objectIsSubsetOfObject(fromRootSchema, intoRootSchema);
  }, [fromRootSchema, intoRootSchema]);

  const icon = useMemo(() => {
    if (theme.name == "light") {
      return props?.pluginVersion?.selectedLightIcon as string;
    }
    return props?.pluginVersion?.selectedDarkIcon as string;
  }, [
    theme.name,
    props?.pluginVersion?.selectedDarkIcon,
    props?.pluginVersion?.selectedLightIcon,
  ]);

  const disabledTextColor = useMemo(() => {
    if (theme.name == "light") {
      return ColorPalette.gray;
    }
    return ColorPalette.gray;
  }, [theme.name]);

  const copyDisabled = useMemo(() => {
    if (!isPermitted) {
      return true;
    }
    if (!isCompatible) {
      return true;
    }
    if (isUpsteamInstruction) {
      return true;
    }
    return false;
  }, [isCompatible, isPermitted, isUpsteamInstruction]);

  const isMissingInInto = useMemo(() => {
    return !props.intoPluginVersions?.find(p => p.name == manifest.name);
  }, [props.intoPluginVersions, manifest.name]);

  const isSelected = useMemo(() => {
    return !!copyInstructions[props.pluginVersion.name as string];
  }, [copyInstructions, props.pluginVersion]);

  const showManualCopy = useMemo(() => {
    if (copyDisabled) {
      return false;
    }
    if (!isSelected) {
      return false;
    }
    if (isUpsteamInstruction) {
      return false;
    }
    return props.pluginVersion.managedCopy;
  }, [isSelected, copyDisabled, isUpsteamInstruction, props.pluginVersion]);

  const showNotCompatible = useMemo(() => {
    if (!isPermitted) {
      return false;
    }
    if (!isCompatible) {
      return true;
    }
    return false;
  }, [isPermitted, copyDisabled, isCompatible]);

  const manualCopyDisabled = useMemo(() => {
    return isUpsteamInstruction;
  }, [isUpsteamInstruction]);

  const copyPriorityDisabled = useMemo(() => {
    if (!isSelected) {
      return true;
    }
    if (isUpsteamInstruction && isMissingInInto) {
      return true;
    }
    return copyInstructions[props.pluginVersion.name as string]?.isManualCopy;
  }, [isSelected, props.pluginVersion.name, copyInstructions, isMissingInInto, isUpsteamInstruction]);

  const referencePriorityDisabled = useMemo(() => {
    if (isUpsteamInstruction && isMissingInInto) {
      return true;
    }
    return false;
  }, [isMissingInInto, isUpsteamInstruction]);

  const onSelect = useCallback(() => {
    if (!isSelected) {
      setCopyInstructions({
        ...copyInstructions,
        [props.pluginVersion.name as string]: {
          isManualCopy: false,
          referencePriority: "yours",
          copyPriority: "yours",
          manualCopyList: [],
        },
      });
      return;
    }
    delete copyInstructions[props.pluginVersion.name as string];
    setCopyInstructions({ ...copyInstructions });
  }, [isSelected, props.pluginVersion.name, copyInstructions]);

  useEffect(() => {
    if (isUpsteamInstruction && !isSelected) {
      setCopyInstructions({
        ...copyInstructions,
        [manifest.name as string]: {
          isManualCopy: false,
          referencePriority: isUpsteamInstruction && isMissingInInto ? "theirs" : "yours",
          copyPriority: isUpsteamInstruction && isMissingInInto ? "theirs" : "yours",
          manualCopyList: [],
        },
      })
      return;
    }
    if (isUpsteamInstruction && copyInstructions[manifest.name]?.isManualCopy) {
      setCopyInstructions({
        ...copyInstructions,
        [manifest.name as string]: {
          isManualCopy: false,
          referencePriority: isUpsteamInstruction && isMissingInInto ? "theirs" : "yours",
          copyPriority: isUpsteamInstruction && isMissingInInto ? "theirs" : "yours",
          manualCopyList: [],
        },
      })
      return;
    }
  }, [isSelected, isUpsteamInstruction, copyInstructions, manifest.name, isMissingInInto]);

  const manualCopySelected = useMemo(() => {
    if (!isSelected) {
      return false;
    }
    return copyInstructions[props.pluginVersion.name as string].isManualCopy;
  }, [isSelected, copyInstructions, props.pluginVersion]);

  const onSelectManualCopy = useCallback(() => {
    const isManualCopy =
      !copyInstructions[props.pluginVersion.name as string].isManualCopy;
    setCopyInstructions({
      ...copyInstructions,
      [props.pluginVersion.name as string]: {
        isManualCopy,
        referencePriority: "yours",
        copyPriority: "yours",
        manualCopyList: [],
      },
    });
    if (isManualCopy) {
      setCopyInstructions({
        ...copyInstructions,
        [props.pluginVersion.name as string]: {
          ...copyInstructions[props.pluginVersion.name as string],
          isManualCopy,
          copyPriority: "theirs",
        },
      });
    } else {
      setCopyInstructions({
        ...copyInstructions,
        [props.pluginVersion.name as string]: {
          ...copyInstructions[props.pluginVersion.name as string],
          isManualCopy,
          copyPriority: "yours",
        },
      });
    }
  }, [isSelected, props.pluginVersion.name, copyInstructions]);

  const onUpdateCopyPriority = useCallback((copyPriority: string) => {
      setCopyInstructions({
        ...copyInstructions,
        [props.pluginVersion.name as string]: {
          ...copyInstructions[props.pluginVersion.name as string],
          copyPriority: copyPriority as "yours"|"theirs"
        },
      });
  }, [copyInstructions]);

  const onUpdateReferencePriority = useCallback((referencePriority: string) => {
      setCopyInstructions({
        ...copyInstructions,
        [props.pluginVersion.name as string]: {
          ...copyInstructions[props.pluginVersion.name as string],
          referencePriority: referencePriority as "theirs"|"yours"
        },
      });
  }, [copyInstructions]);

  return (
    <TopContainer style={{ backgroundColor, borderColor: backgroundColor }}>
      <Row>
        <div style={{ flex: 4, display: "flex", alignItems: "center" }}>
          <Icon src={icon} />
          <PluginTitle>{props?.pluginVersion?.displayName}</PluginTitle>
        </div>
        <div
          style={{
            flex: 3,
            justifyContent: "flex-end",
            display: "flex",
            paddingRight: 32,
          }}
        >
          {showManualCopy && (
            <CopyRow>
              <Text
                style={{
                  color: manualCopyDisabled
                    ? disabledTextColor
                    : theme.colors.contrastText,
                }}
              >
                {"manual copy"}
              </Text>
              <Checkbox
                disabled={manualCopyDisabled}
                isChecked={manualCopySelected}
                onChange={onSelectManualCopy}
              />
            </CopyRow>
          )}
          {isUpsteamInstruction && (

            <CopyRow>
              <UpsteamText>{'upsteam dependency'}</UpsteamText>
            </CopyRow>
          )}
          {!isPermitted && (
            <CopyRow>
              <WarningLabel label={"not allowed"} size={"small"} />
            </CopyRow>
          )}
          {showNotCompatible && (
            <CopyRow>
              <WarningLabel label={"incompatible"} size={"small"} />
            </CopyRow>
          )}
        </div>
        <div
          style={{
            flex: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <CopyRow>
            <Text
              style={{
                color: copyDisabled
                  ? disabledTextColor
                  : theme.colors.contrastText,
              }}
            >
              {"copy"}
            </Text>
            <Checkbox
              disabled={copyDisabled}
              isChecked={isSelected}
              onChange={onSelect}
            />
          </CopyRow>
        </div>
      </Row>
      {isSelected && !isMissingInInto && (
        <>
          <RowWithoutHeight style={{ paddingBottom: 8 }}>
            <div style={{ flex: 4 }}></div>
            <div
              style={{
                flex: 3,
                justifyContent: "flex-end",
                display: "flex",
                paddingRight: 8,
              }}
            >
              <CopyRow>
                <Text
                  style={{
                    color: copyPriorityDisabled
                      ? disabledTextColor
                      : theme.colors.contrastText,
                  }}
                >
                  {"copy priority"}
                </Text>
              </CopyRow>
            </div>
            <div style={{ flex: 3 }}>
              <DualToggle
                isDisabled={copyPriorityDisabled}
                onChange={onUpdateCopyPriority}
                value={
                  copyInstructions[props.pluginVersion.name as string]
                    .copyPriority
                }
                leftOption={{
                  label: "into",
                  value: "yours",
                }}
                rightOption={{
                  label: "from",
                  value: "theirs",
                }}
              />
            </div>
          </RowWithoutHeight>
          <RowWithoutHeight style={{ paddingTop: 8, paddingBottom: 8 }}>
            <div style={{ flex: 4 }}>
              {manualCopySelected && copyInstructions[props.pluginVersion.name as string].manualCopyList.length == 0 && (
                <NoReferencesText>{'No manual references selected'}</NoReferencesText>
              )}
            </div>
            <div
              style={{
                flex: 3,
                justifyContent: "flex-end",
                display: "flex",
                paddingRight: 8,
              }}
            >
              <CopyRow>
                <Text
                  style={{
                    color: referencePriorityDisabled
                      ? disabledTextColor
                      : theme.colors.contrastText,
                  }}
                >
                  {"reference priority"}
                </Text>
              </CopyRow>
            </div>
            <div style={{ flex: 3 }}>
              <DualToggle
                isDisabled={referencePriorityDisabled}
                onChange={onUpdateReferencePriority}
                value={
                  copyInstructions[props.pluginVersion.name as string]
                    .referencePriority
                }
                leftOption={{
                  label: "into",
                  value: "yours",
                }}
                rightOption={{
                  label: "from",
                  value: "theirs",
                }}
              />
            </div>
          </RowWithoutHeight>
        </>
      )}
    </TopContainer>
  );
};

export default React.memo(LocalRepoRow);
