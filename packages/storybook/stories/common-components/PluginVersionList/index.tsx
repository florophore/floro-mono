import React, { useMemo } from "react";
import { PluginVersion } from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import PluginVersionRow from "./PluginVersionRow";

const SectionContainer = styled.div`
  max-width: 624px;
  margin-bottom: 48px;
`;

const SectionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
  margin-bottom: 24px;
`;

const DependencyBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export interface Props {
  versions: PluginVersion[];
  currentVersion: PluginVersion;
  icons: { [key: string]: string };
  linkPrefix: string;
  onClickReleaseVersion: (version: PluginVersion) => void;
}

const PluginVersionList = (props: Props) => {
  return (
    <SectionContainer>
      <SectionTitle>{"Versions"}</SectionTitle>
      <DependencyBox>
        {props.versions?.map((pluginVersion, index) => {
          return (
            <PluginVersionRow
              isFirst={0 == index}
              key={index}
              isEven={index % 2 == 0}
              isSelected={
                pluginVersion?.version == props.currentVersion?.version
              }
              version={pluginVersion}
              linkPrefix={props.linkPrefix}
              onClickReleaseVersion={props.onClickReleaseVersion}
            />
          );
        })}
      </DependencyBox>
    </SectionContainer>
  );
};

export default React.memo(PluginVersionList);
