import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";
import {useParams, useSearchParams} from 'react-router-dom';

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import { RemoteCommitState } from "../hooks/remote-state";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import { Branch } from "floro/dist/src/repo";
import { useRepoLinkBase } from "../hooks/remote-hooks";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";

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

const HistoryBranchWrapper = styled.div`
  transform: scale(0.8);
  margin-left: -48px;
  margin-top: -8px;
`;

interface Props {
  repository: Repository;
  plugin?: string;
  remoteCommitState: RemoteCommitState;
}

const RemoteHistoryHeader = (props: Props) => {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const branchQuery = searchParams.get("branch");
  const loaderColor = useMemo(
    () => (theme.name == "light" ? "purple" : "lightPurple"),
    [theme.name]
  );

  const navigate = useNavigate();

  const warning = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name]);

  const linkBase = useRepoLinkBase(props.repository);

  const homeLink = useMemo(() => {
    if (!props.repository?.branchState?.branchId) {
      return `${linkBase}?from=remote&plugin=${props?.plugin ?? "home"}`;
    }
    return `${linkBase}?from=remote&branch=${
      props.repository?.branchState?.branchId
    }&plugin=${props.plugin ?? "home"}`;
  }, [props.repository?.branchState, linkBase, props.plugin]);

  const historyLink = useMemo(() => {
    return `${linkBase}/history?from=remote&plugin=${props.plugin ?? "home"}`;
  }, [props.repository?.branchState, linkBase, props.plugin]);

  const onChangeBranch = useCallback(
    (branch: Branch | null) => {
      if (branch?.id) {
        navigate(historyLink + "&branch=" + branch?.id);
      }
    },
    [historyLink]
  );

  const [branches, setBranches] = useState(props.repository?.repoBranches ?? []);
  useEffect(() => {
    if (props.repository?.repoBranches) {
      setBranches(props.repository?.repoBranches)
    }
  }, [props.repository?.repoBranches])

  const branch = useMemo(() => {
    return branches?.find(
      (b) => b?.id == props.repository?.branchState?.branchId
    ) ?? branches?.find(
      (b) => b?.id == branchQuery
    );
  }, [branches, branchQuery, props.repository?.branchState?.branchId]);

  return (
    <>
      <Container>
        <LeftContainer>
          <HistoryBranchWrapper>
            <BranchSelector
              size={"wide"}
              branch={(branch as Branch) ?? null}
              branches={(branches ?? []) as Branch[]}
              onChangeBranch={onChangeBranch}
            />
          </HistoryBranchWrapper>
        </LeftContainer>
        <RightContainer>
          <Link to={homeLink}>
            <div style={{ width: 120 }}>
              <Button
                label={"hide history"}
                bg={"gray"}
                size={"small"}
                textSize={"small"}
              />
            </div>
          </Link>
        </RightContainer>
      </Container>
    </>
  );
};

export default React.memo(RemoteHistoryHeader);
