import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Link } from "react-router-dom";

import DualToggle from "@floro/storybook/stories/design-system/DualToggle";
import ColorPalette from "@floro/styles/ColorPalette";
import { useMergeRequestsFilter } from "../hooks/remote-state";
import BranchBlue from "@floro/common-assets/assets/images/icons/branch_icon.blue.svg";
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

const BranchHistoryContainer = styled.div`
  position: relative;
`;

const BranchNotification = styled.div`
  position: absolute;
  height: 24px;
  width: 24px;
  top: -12px;
  right: -28px;
  background: red;
  border-radius: 50%;
  background: ${ColorPalette.orange};
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NotificationText = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 0.85rem;
  color: ${ColorPalette.white};
`;

const BranchHistoryWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const BranchText = styled.span`
  color: ${(props) => props.theme.colors.linkColor};
  font-weight: 600;
  font-size: 1.2rem;
  font-family: "MavenPro";
  margin-left: 16px;
`;

const BranchHistoryIcon = styled.img`
  height: 24px;
  width: 24px;
`;

interface Props {
  repository: Repository;
  plugin?: string;
}

const RemoteMergeRequestsHistoryHeader = (props: Props) => {
  const { filterMR, setFilterMR } = useMergeRequestsFilter();

  const linkBase = useRepoLinkBase(props.repository, "home");

  const branchesLink = useMemo(() => {
    if (!props.repository?.branchState?.branchId) {
      return `${linkBase}/openbranches?from=remote&plugin=${
        props?.plugin ?? "home"
      }`;
    }
    return `${linkBase}/openbranches?from=remote&branch=${
      props.repository?.branchState?.branchId
    }&plugin=${props.plugin ?? "home"}`;
  }, [props.repository?.branchState, linkBase, props.plugin]);

  const openBranchesCount = useMemo(() => {
    return props?.repository?.openBranchesWithoutMergeRequestsCount ?? 0;
  }, [props?.repository?.openBranchesWithoutMergeRequestsCount]);

  const openMRCount = useMemo(() => {
    return props?.repository?.openMergeRequestsCount ?? 0;
  }, [props?.repository?.openMergeRequestsCount]);

  const closedMRCount = useMemo(() => {
    return props?.repository?.closedMergeRequestsCount ?? 0;
  }, [props?.repository?.openMergeRequestsCount]);

  const openBranchText = useMemo(() => {
    if (openBranchesCount == 1) {
      return `1 branch`;
    }
    return `${openBranchesCount} branches`;
  }, [openBranchesCount]);

  return (
    <Container>
      <LeftContainer>
        <DualToggle
          onChange={setFilterMR as (_: string) => void}
          value={filterMR}
          leftOption={{
            label: (
              <span style={{ position: "relative" }}>
                {openMRCount + " open"}
                {(props.repository?.openUserMergeRequestsCount ?? 0) > 0 && (
                  <BranchNotification>
                    <NotificationText>
                      {props.repository.openUserMergeRequestsCount}
                    </NotificationText>
                  </BranchNotification>
                )}
              </span>
            ),
            value: "open",
          }}
          rightOption={{
            label: (
              <span style={{ position: "relative" }}>
                {closedMRCount + " closed"}
              </span>
            ),
            value: "closed",
          }}
        />
      </LeftContainer>
      <RightContainer>
        <Link to={branchesLink}>
          <BranchHistoryContainer>
            <BranchHistoryWrapper>
              <BranchHistoryIcon src={BranchBlue} />
              <BranchText>{openBranchText}</BranchText>
            </BranchHistoryWrapper>
          </BranchHistoryContainer>
        </Link>
      </RightContainer>
    </Container>
  );
};

export default React.memo(RemoteMergeRequestsHistoryHeader);
