import React, { useMemo, useState, useCallback } from "react";
import { PluginVersion } from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import PluginVersionNavigatorRow from "./PluginVersionNavigatorRow";
import DualToggle from "@floro/storybook/stories/design-system/DualToggle";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import { ApiResponse } from "@floro/floro-lib/src/repo";

const SectionContainer = styled.div`
  max-width: 760px;
  margin-bottom: 48px;
`;

const SectionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const DependencyBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export interface Props {
  versions: PluginVersion[];
  currentVersion: PluginVersion;
  linkPrefix: string;
  canRelease: boolean;
  onClickReleaseVersion: (version: PluginVersion) => void;
  repository: Repository;
  apiResponse: ApiResponse;
  isCompatible: boolean;
}

const PluginVersionList = (props: Props) => {
  const versions = useMemo(() => {
    const currentVersion = props.apiResponse.applicationState.plugins?.find(({key}) => key == props?.versions[0].name);
    return props.versions.filter((v, index) => {
      if (currentVersion && currentVersion.value == v.version) {
        return true;
      }
      return v.version?.startsWith("dev") || v.state == "released" || index == 0;
    });
  }, [props.versions, props.apiResponse.applicationState.plugins]);

  return (
    <SectionContainer>
      <TopRow>
        <SectionTitle>{"Versions"}</SectionTitle>
        {!props.isCompatible &&
          <WarningLabel label={"incompatible with repo plugins"} size={"small"}/>
        }
      </TopRow>
      <DependencyBox>
        {versions?.map((pluginVersion, index) => {
          return (
            <PluginVersionNavigatorRow
              isFirst={0 == index}
              key={index}
              isEven={index % 2 == 0}
              isSelected={
                pluginVersion?.version == props.currentVersion?.version
              }
              version={pluginVersion}
              linkPrefix={props.linkPrefix}
              canRelease={props.canRelease}
              onClickReleaseVersion={props.onClickReleaseVersion}
              repository={props.repository}
              apiResponse={props.apiResponse}
            />
          );
        })}
      </DependencyBox>
    </SectionContainer>
  );
};

export default React.memo(PluginVersionList);
