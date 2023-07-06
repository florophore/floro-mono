
import React, { useRef, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";
import { Link } from "react-router-dom";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import DualToggle from "@floro/storybook/stories/design-system/DualToggle";
import ColorPalette from "@floro/styles/ColorPalette";
import { RemoteCommitState } from "../hooks/remote-state";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import { Branch } from "floro/dist/src/repo";
import HistoryBlue from "@floro/common-assets/assets/images/repo_icons/history.blue.svg";
import { useRepoLinkBase } from "../hooks/remote-hooks";

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

const InvalidState = styled.img`
  height: 32px;
  width: 32px;
`;

const InvalidText = styled.span`
  color: ${(props) => props.theme.colors.contrastText};
  font-weight: 500;
  font-size: 1rem;
  font-family: "MavenPro";
  margin-left: 8px;
`;

const ChangeDot = styled.div`
  position: absolute;
  right: -12px;
  top: -2px;
  height: 12px;
  width: 12px;
  border: 2px solid ${ColorPalette.white};
  border-radius: 50%;
`;

const CommitHistoryWrapper =styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const CommitText = styled.span`
  color: ${(props) => props.theme.colors.linkColor};
  font-weight: 600;
  font-size: 1.2rem;
  font-family: "MavenPro";
  margin-left: 16px;
`;

const CommitHistoryIcon = styled.img`
  height: 24px;
  width: 24px;
`;

interface Props {
  repository: Repository;
  plugin?: string;
  remoteCommitState: RemoteCommitState;
}

const RemoteRepoSubHeader = (props: Props) => {
  const theme = useTheme();
  const loaderColor = useMemo(
    () => (theme.name == "light" ? "purple" : "lightPurple"),
    [theme.name]
  );

  const linkBase = useRepoLinkBase(props.repository, "home");

  const historyLink = useMemo(() => {
    if (!props.repository?.branchState?.branchId) {

      return `${linkBase}/history?from=remote&plugin=${props?.plugin ?? 'home'}`
    }
    return `${linkBase}/history?from=remote&branch=${props.repository?.branchState?.branchId}&plugin=${props.plugin ?? 'home'}`

  }, [props.repository?.branchState, linkBase, props.plugin])

  const warning = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name]);

  const isInvalid = useMemo(() => {
    return (
      (props.remoteCommitState?.binaryMap?.[props?.plugin ?? ""]?.length ?? 0) >
      0
    );
  }, [props.remoteCommitState?.binaryMap, props.plugin]);

  const commitText = useMemo(() => {
    const commitCount = props.repository?.branchState?.commitsSize ?? 0;
    if (commitCount == 1) {
      return `1 commit`
    }
    return `${commitCount} commits`;

  }, [props.repository?.branchState?.commitsSize])
  return (
    <>
        <Container>
          <LeftContainer>
            {isInvalid && (
              <>
                <InvalidState src={warning} />
                <InvalidText>{`(invalid)`}</InvalidText>
              </>
            )}
          </LeftContainer>
          <RightContainer>
            <Link to={historyLink}>
              <CommitHistoryWrapper>
                <CommitHistoryIcon src={HistoryBlue}/>
                <CommitText>{`${commitText}`}</CommitText>
              </CommitHistoryWrapper>
            </Link>
          </RightContainer>
        </Container>
    </>
  );
};

export default React.memo(RemoteRepoSubHeader);