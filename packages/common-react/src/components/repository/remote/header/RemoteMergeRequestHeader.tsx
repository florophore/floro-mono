import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";
import { useSearchParams} from 'react-router-dom';

import { RemoteCommitState, useMergeRequestReviewPage, useRemoteCompareFrom } from "../hooks/remote-state";
import { useRepoLinkBase } from "../hooks/remote-hooks";
import { Link } from "react-router-dom";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  width: 100%;
  height: 72px;
  border-bottom: 1px solid
    ${(props) => props.theme.colors.localRemoteBorderColor};
  box-sizing: border-box;
  padding-left: 24px;
  padding-right: 40px;
  box-shadow: -10px 2px 3px 4px
    ${(props) => props.theme.shadows.versionControlSideBarShadow};
  z-index: 1;
  position: relative;
`;

const LeftContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 72px;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  height: 72px;
`;

interface Props {
  repository: Repository;
  plugin?: string;
}

const RemoteMergeRequestHeader = (props: Props) => {
  const theme = useTheme();
  const linkBase = useRepoLinkBase(props.repository);

  const { reviewPage, setReviewPage } = useMergeRequestReviewPage();

  const onSetCommits = useCallback(() => {
    setReviewPage("commits");
  }, []);

  const onSetChanges = useCallback(() => {
    setReviewPage("changes")
  }, []);

  return (
    <>
      <Container>
        <LeftContainer>
        </LeftContainer>
        <RightContainer>
            <div style={{ width: 120, marginRight: 24 }}>
              <Button
                onClick={onSetChanges}
                label={"view changes"}
                bg={"teal"}
                size={"small"}
                textSize={"small"}
              />
            </div>
          <div style={{ width: 120 }}>
            <Button
              onClick={onSetCommits}
              label={"view commits"}
              bg={"purple"}
              size={"small"}
              textSize={"small"}
            />
          </div>
        </RightContainer>
      </Container>
    </>
  );
};

export default React.memo(RemoteMergeRequestHeader);
