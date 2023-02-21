import React, { useMemo } from "react";
import { PluginVersion } from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Link } from "react-router-dom";

const SectionContainer = styled.div`
  max-width: 528px;
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

const LeftSide = styled.div`
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
`;

const VersionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.pluginDisplaySubTitle};
`;

export interface Props {
  dependencies: PluginVersion[];
  icons: { [key: string]: string };
}

const PluginDependencyList = (props: Props) => {
  const theme = useTheme();

  const rows = useMemo(() => {
    return props.dependencies?.map((pluginVersion, index) => {
    const link =
        pluginVersion?.ownerType == "user_plugin"
        ? `/users/@/${pluginVersion.user?.username}/plugins/${pluginVersion.name}/v/${pluginVersion.version}`
        : `/orgs/@/${pluginVersion.organization?.handle}/plugins/${pluginVersion.name}/v/${pluginVersion.version}`;
      const icon =
        theme.name == "light"
          ? pluginVersion.lightIcon ?? ""
          : pluginVersion.darkIcon ?? "";
      return (
        <Link key={index} to={link}>
          <Row
            style={{
              marginBottom:
                index != (props?.dependencies?.length ?? 0) - 1 ? 18 : 0,
            }}
          >
            <LeftSide>
              <Icon src={props.icons[icon] ?? icon} />
              <DependencyTitle>{pluginVersion?.name}</DependencyTitle>
            </LeftSide>
            <VersionTitle>{pluginVersion?.version}</VersionTitle>
          </Row>
        </Link>
      );
    });
  }, [theme.name, props.dependencies]);
  return (
    <SectionContainer>
      <SectionTitle>{"Dependencies"}</SectionTitle>
      <DependencyBox>{rows}</DependencyBox>
    </SectionContainer>
  );
};

export default React.memo(PluginDependencyList);
