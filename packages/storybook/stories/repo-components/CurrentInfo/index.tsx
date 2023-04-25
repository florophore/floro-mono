import React, { useMemo } from "react";
import styled from "@emotion/styled";
import ColorPalette from "@floro/styles/ColorPalette";
import { useTheme } from "@emotion/react";
import BranchIconLight from "@floro/common-assets/assets/images/icons/branch_icon.light.svg";
import BranchIconDark from "@floro/common-assets/assets/images/icons/branch_icon.dark.svg";

import CommitIconLight from "@floro/common-assets/assets/images/icons/commit_icon.light.svg";
import CommitIconDark from "@floro/common-assets/assets/images/icons/commit_icon.dark.svg";

import MergeIconLight from "@floro/common-assets/assets/images/repo_icons/merge.gray.svg";
import MergeIconDark from "@floro/common-assets/assets/images/repo_icons/merge.white.svg";

import ChangeDirectionIcon from "@floro/common-assets/assets/images/repo_icons/change_direction.dark.svg";

import Button from "../../design-system/Button";
import { Branch, CommitData } from "@floro/floro-lib/src/repo";
import { Repository } from "@floro/graphql-schemas/build/generated/main-graphql";

import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";

import WarningIconLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningIconDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  padding: 8px;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const TitleSpan = styled.span`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.titleText};
  white-space: nowrap;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LeftRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 188px;
`;

const RightRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 252px;
`;

const Icon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 12px;
`;

const NoIcon = styled.div`
  width: 32px;
  height: 32px;
  margin-right: 12px;
`;

const LabelSpan = styled.span`
  font-size: 1.1rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.contrastTextLight};
  white-space: nowrap;
`;

const ValueSpan = styled.span`
  font-size: 1rem;
  font-family: "MavenPro";
  font-weight: 500;
  color: ${(props) => props.theme.colors.contrastText};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ValueItalicSpan = styled.span`
  font-size: 0.9rem;
  font-family: "MavenPro";
  font-weight: 700;
  font-style: italic;
  color: ${(props) => props.theme.colors.contrastText};
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const GoBackIcon = styled.img`
  width: 32px;
  height: 32px;
  cursor: pointer;
`;

const WarningImg = styled.img`
  width: 24px;
  height: 24px;
  margin-left: 12px;
`;

export interface Props {
  respository: Repository;
  showWIP?: boolean;
  showMergeButton?: boolean;
  isWIP?: boolean;
  isMerge?: boolean;
  mergeDirection?: "yours" | "theirs";
  branch?: Branch;
  baseBranch?: Branch;
  lastCommit?: CommitData;
  mergeCommit?: CommitData;
  showBranchButtons?: boolean;
  onShowBranches?: () => void;
  onShowEditBranch?: () => void;
  onSwitchToTheirs?: () => void;
  onSwitchToYours?: () => void;
  changeDirectionIsLoading?: boolean;
  showBackButton?: boolean;
  onGoBack?: () => void;
}

const CurrentInfo = (props: Props): React.ReactElement => {
  const showWIP = props.showWIP ?? false;
  const theme = useTheme();
  const branchIcon = useMemo(() => {
    if (theme.name == "light") {
      return BranchIconLight;
    }
    return BranchIconDark;
  }, [theme.name]);

  const commitIcon = useMemo(() => {
    if (theme.name == "light") {
      return CommitIconLight;
    }
    return CommitIconDark;
  }, [theme.name]);

  const mergeIcon = useMemo(() => {
    if (theme.name == "light") {
      return MergeIconLight;
    }
    return MergeIconDark;
  }, [theme.name]);

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);

  const commitShaShort = useMemo(() => {
    if (props.lastCommit) {
      return props.lastCommit?.sha?.substring?.(0, 4) ?? null;
    }
    return null;
  }, [props.lastCommit]);

  const mergeCommitShaShort = useMemo(() => {
    if (props.mergeCommit) {
      return props.mergeCommit?.sha?.substring?.(0, 4) ?? null;
    }
    return null;
  }, [props.mergeCommit]);

  const warningIcon = useMemo(() => {
    if (theme.name == "light") {
      return WarningIconLight;
    }
    return WarningIconDark;
  }, [theme.name]);

  return (
    <Container>
      <Row style={{ marginBottom: 16, height: 40 }}>
        <span>
          <TitleSpan style={{ color: theme.colors.contrastTextLight }}>
            {"Repository: "}
          </TitleSpan>
          <TitleSpan style={{ fontWeight: 500 }}>
            {props.respository.name}
          </TitleSpan>
        </span>
        {props.showBackButton && (
          <GoBackIcon src={backArrowIcon} onClick={props.onGoBack} />
        )}
      </Row>
      <Row>
        <LeftRow>
          <Icon src={branchIcon} />
          <LabelSpan>Current branch:</LabelSpan>
        </LeftRow>
        <RightRow>
          {props.branch && <ValueSpan>{props.branch.name}</ValueSpan>}
          {!props.branch && <ValueSpan>{"None"}</ValueSpan>}
          {!props.branch && <WarningImg src={warningIcon}/>}
        </RightRow>
      </Row>
      {props.branch && (
        <Row style={{ marginTop: 6 }}>
          <LeftRow>
            <NoIcon />
            <LabelSpan>Base branch:</LabelSpan>
          </LeftRow>
          <RightRow>
            {props.baseBranch && (
              <ValueSpan>{props.baseBranch?.name}</ValueSpan>
            )}
            {!props.baseBranch && <ValueSpan>{"None"}</ValueSpan>}
          </RightRow>
        </Row>
      )}
      <Row style={{ marginTop: 12 }}>
        <LeftRow>
          <Icon src={commitIcon} />
          <LabelSpan>Last commit:</LabelSpan>
        </LeftRow>
        <RightRow>
          {props.lastCommit && (
            <ValueSpan>
              {commitShaShort && (
                <ValueItalicSpan style={{ marginRight: 8 }}>
                  {`(${commitShaShort})`}
                </ValueItalicSpan>
              )}
              {props.lastCommit?.message}
            </ValueSpan>
          )}
          {!props.lastCommit && <ValueSpan>{"None"}</ValueSpan>}
        </RightRow>
      </Row>
      {showWIP && (
        <Row style={{ marginTop: 6 }}>
          <LeftRow>
            <NoIcon />
            <LabelSpan>WIP status:</LabelSpan>
          </LeftRow>
          <RightRow>
            {props.isWIP && (
              <ValueItalicSpan style={{ color: theme.colors.titleText }}>
                {"In progress"}
              </ValueItalicSpan>
            )}
            {!props.isWIP && <ValueItalicSpan>{"No changes"}</ValueItalicSpan>}
          </RightRow>
        </Row>
      )}
      {props.isMerge && props.mergeCommit && (
        <>
          <Row style={{ marginTop: 12 }}>
            <LeftRow>
              <Icon src={mergeIcon} />
              <LabelSpan>Merge commit:</LabelSpan>
            </LeftRow>
            <RightRow>
              {props.mergeCommit && (
                <ValueSpan>
                  {mergeCommitShaShort && (
                    <ValueItalicSpan style={{ marginRight: 8 }}>
                      {`(${mergeCommitShaShort})`}
                    </ValueItalicSpan>
                  )}
                  {props.mergeCommit?.message}
                </ValueSpan>
              )}
              {!props.mergeCommit && <ValueSpan>{"None"}</ValueSpan>}
            </RightRow>
          </Row>
          <Row style={{ marginTop: 6 }}>
            <LeftRow>
              <NoIcon />
              <LabelSpan>Merge direction:</LabelSpan>
            </LeftRow>
            <RightRow>
              {props.mergeDirection == "yours" && (
                <ValueSpan style={{ color: theme.colors.titleText, fontWeight: 800 }}>
                  {"Yours"}
                </ValueSpan>
              )}
              {props.mergeDirection == "theirs" && (
                <ValueSpan style={{ color: theme.colors.titleText, fontWeight: 800 }}>
                  {"Theirs"}
                </ValueSpan>
              )}
            </RightRow>
          </Row>
        </>
      )}
      {props.showBranchButtons && (
        <ButtonRow style={{ marginTop: 16 }}>
          <Button
            label={"branches"}
            bg={"purple"}
            size={"medium"}
            onClick={props.onShowBranches}
          />
          <Button
            label={"edit branch"}
            bg={"orange"}
            size={"medium"}
            onClick={props.onShowEditBranch}
            isDisabled={!props.branch}
          />
        </ButtonRow>
      )}

      {props.isMerge && props.showMergeButton && (
        <ButtonRow style={{ marginTop: 16 }}>
          {props.mergeDirection == "yours" && (
            <Button
            style={{

            }}
              label={(
                <div style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingLeft: 24,
                  paddingRight: 36,
                }}>
                  <img style={{
                    height: 32,
                    width: 32,
                    marginRight: 16
                  }} src={ChangeDirectionIcon}/>
                  <span>
                    {"switch merge direction to theirs"}
                  </span>
                </div>
              )}
              bg={"purple"}
              size={"extra-big"}
              textSize="small"
              onClick={props.onSwitchToTheirs}
              isLoading={props.changeDirectionIsLoading}
            />
          )}
          {props.mergeDirection == "theirs" && (
            <Button
              label={(
                <div style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingLeft: 24,
                  paddingRight: 36,
                }}>
                  <img style={{
                    height: 32,
                    width: 32,
                    marginRight: 16
                  }} src={ChangeDirectionIcon}/>
                  <span>
                    {"switch merge direction to yours"}
                  </span>
                </div>
              )}
              bg={"purple"}
              size={"extra-big"}
              textSize="small"
              onClick={props.onSwitchToYours}
              isLoading={props.changeDirectionIsLoading}
            />
          )}
        </ButtonRow>
      )}
    </Container>
  );
};

export default React.memo(CurrentInfo);
