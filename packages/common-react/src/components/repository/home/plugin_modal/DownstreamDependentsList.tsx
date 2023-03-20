
import React, { useMemo } from "react";
import { Plugin, PluginVersion, Repository, useGetDependencyPluginsForPluginQuery } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";

const SectionContainer = styled.div`
  max-width: 528px;
  margin-bottom: 48px;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const LeftSide = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RightSide = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Icon = styled.img`
  height: 56px;
  width: 56px;
  margin-right: 12px;
`;

const DependencyTitle = styled.h2`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  text-decoration: underline;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
  cursor: pointer;
`;

const VersionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.pluginDisplaySubTitle};
`;

export interface Props {
  dependents: Array<[Plugin, PluginVersion]>;
  pluginVersion: PluginVersion;
  onChangePluginVersion: (plugin: Plugin, pluginVersion: PluginVersion) => void;
  repository: Repository;
}

const DownstreamDependentsList = (props: Props) => {
  const theme = useTheme();

  const rows = useMemo(() => {
    return props.dependents?.map(([plugin, pluginVersion], index) => {
      const icon =
        theme.name == "light"
          ? pluginVersion.selectedLightIcon ?? ""
          : pluginVersion.selectedDarkIcon ?? "";

      return (
        <Row
          key={index}
          style={{
            marginBottom:
              index != (props?.dependents?.length ?? 0) - 1 ? 18 : 0,
          }}
          onClick={() => {
            props.onChangePluginVersion(plugin, pluginVersion);
          }}
        >
          <LeftSide>
            <Icon src={icon} />
            <DependencyTitle>{pluginVersion?.name}</DependencyTitle>
          </LeftSide>
          <RightSide>
            <VersionTitle>{pluginVersion?.version}</VersionTitle>
          </RightSide>
        </Row>
      );
    });
  }, [
    theme.name,
    props.dependents,
    props.onChangePluginVersion,
  ]);
  return (
    <SectionContainer>
      <TopRow>
        <SectionTitle>{"Downstream Dependents"}</SectionTitle>
      </TopRow>
      <DependencyBox>{rows}</DependencyBox>
    </SectionContainer>
  );
};

export default React.memo(DownstreamDependentsList);