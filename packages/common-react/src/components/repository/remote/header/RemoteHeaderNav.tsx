import React, { useRef, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import DualToggle from "@floro/storybook/stories/design-system/DualToggle";
import ColorPalette from "@floro/styles/ColorPalette";
import { ComparisonState, RemoteCommitState, useMergeRequestReviewPage } from "../hooks/remote-state";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import { Branch } from "floro/dist/src/repo";
import RemoteRepoSubHeader from './RemoteRepoSubHeader';
import RemoteHistoryHeader from "./RemoteHistoryHeader";
import RemoteCreateMRHeader from "./RemoteCreateMRHeader";
import { RepoPage } from "../../types";
import RemoteMergeRequestsHistoryHeader from "./RemoteMergeRequestsHistoryHeader";
import RemoteMergeRequestHeader from "./RemoteMergeRequestHeader";
import RemoteMRReviewHeader from "./RemoteMRReviewHeader";

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

const HistoryBranchWrapper =styled.div`
  transform: scale(0.8);
  margin-left: -56px;
  margin-top: -8px;
`;

interface Props {
  repository: Repository;
  plugin?: string;
  remoteCommitState: RemoteCommitState;
  comparisonState: ComparisonState;
  page: RepoPage;
}

const RemoteHeaderNav = (props: Props) => {

  const { reviewPage } = useMergeRequestReviewPage();

  if (props.page == "announcements") {
    return null;
  }

  if (props.page == "settings") {
    return null;
  }

  if (props.page == "api-settings") {
    return null;
  }

  if (props.page == "branch-rule") {
    return null;
  }

  if (props.page == "history") {
    return (
      <RemoteHistoryHeader
        repository={props.repository}
        plugin={props.plugin}
        remoteCommitState={props.remoteCommitState}
      />
    );
  }

  if (props.page == "merge-request") {
    if (reviewPage != "none") {
    return (
      <RemoteMRReviewHeader
        repository={props.repository}
        plugin={props.plugin}
        remoteCommitState={props.remoteCommitState}
        comparisonState={props.comparisonState}
      />
    );
    }
    return (
      <RemoteMergeRequestHeader
        repository={props.repository}
        plugin={props.plugin}
      />
    );
  }

  if (props.page == "merge-requests") {
    return (
      <RemoteMergeRequestsHistoryHeader
        repository={props.repository}
        plugin={props.plugin}
      />
    );
  }

  if (props.page == "merge-request-create") {
    return <RemoteCreateMRHeader
      repository={props.repository}
      plugin={props.plugin}
      remoteCommitState={props.remoteCommitState}
      comparisonState={props.comparisonState}
    />;
  }
  return (
    <RemoteRepoSubHeader
      repository={props.repository}
      plugin={props.plugin}
      remoteCommitState={props.remoteCommitState}
    />
  );
};

export default React.memo(RemoteHeaderNav);