import React, { useMemo, useState, useCallback } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import RepoSideNavigator from "./RepoSideNavigator";
import VersionControlPanel from "./VersionControlPanel";
import { useLocalVCSNavContext } from "./local/vcsnav/LocalVCSContext";
import { useSourceGraphIsShown } from "./ui-state-hook";

const Container = styled.main`
  display: flex;
  flex-direction: row;
  height: 100%;
  flex: 1;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-stretch: 1;
  flex: 1;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
`;

const Content = styled.div`
  max-height: 100%;
  flex: 1;
`;

interface Props {
  repository: Repository;
  plugin: string;
  children: React.ReactElement;
  isExpanded: boolean;
  onSetIsExpanded: (isExpanded: boolean) => void;
}

const RepoNavigator = (props: Props): React.ReactElement => {
  const sourceMapIsShown = useSourceGraphIsShown();
  return (
    <Container>
      {!sourceMapIsShown &&
        <RepoSideNavigator repository={props.repository} plugin={props.plugin} />
      }
      <ContentContainer>
        <Content>{props.children}</Content>
      </ContentContainer>
      <VersionControlPanel
        isExpanded={props.isExpanded}
        onSetIsExpanded={props.onSetIsExpanded}
        repository={props.repository}
      />
    </Container>
  );
};

export default React.memo(RepoNavigator);
