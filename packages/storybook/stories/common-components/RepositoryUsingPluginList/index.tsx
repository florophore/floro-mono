import React from "react";
import { Plugin } from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import RepoRow from "./RepoRow";
import { Repository } from "@floro/graphql-schemas/build/generated/main-client-graphql";

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

export interface Props {
  plugin: Plugin;
  icons: { [key: string]: string };
}

const RepositoryUsingPluginList = (props: Props) => {
  return (
    <SectionContainer>
      <SectionTitle>{"Repositories Using Plugin"}</SectionTitle>
      <DependencyBox>
        {props.plugin.repositoriesThatUsePlugin?.map((repo, index) => {
          return <RepoRow key={index} repo={repo as Repository} />;
        })}
      </DependencyBox>
    </SectionContainer>
  );
};

export default React.memo(RepositoryUsingPluginList);
