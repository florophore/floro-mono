import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import BranchIconLight from "@floro/common-assets/assets/images/icons/branch_icon.light.svg";
import BranchIconDark from "@floro/common-assets/assets/images/icons/branch_icon.dark.svg";

import CommitIconLight from "@floro/common-assets/assets/images/icons/commit_icon.light.svg";
import CommitIconDark from "@floro/common-assets/assets/images/icons/commit_icon.dark.svg";

import {
  MergeRequest,
  Repository,
} from "@floro/graphql-schemas/build/generated/main-graphql";

import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";

import WarningIconLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningIconDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

import MergeIconLight from "@floro/common-assets/assets/images/repo_icons/merge.gray.svg";
import MergeIconDark from "@floro/common-assets/assets/images/repo_icons/merge.white.svg";

import ResolveWhite from "@floro/common-assets/assets/images/repo_icons/resolve.white.svg";
import ResolveGray from "@floro/common-assets/assets/images/repo_icons/resolve.gray.svg";

import AbortWhite from "@floro/common-assets/assets/images/repo_icons/abort.white.svg";
import AbortGray from "@floro/common-assets/assets/images/repo_icons/abort.gray.svg";

import { Manifest } from "floro/dist/src/plugins";
import {
  ApiStoreInvalidity,
  Branch,
  RenderedApplicationState,
} from "floro/dist/src/repo";
import { Link } from "react-router-dom";
import BranchSelector from "../BranchSelector";
import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en";
import ColorPalette from "@floro/styles/ColorPalette";

TimeAgo.addDefaultLocale(en);

export interface RemoteCommitState {
  renderedState: RenderedApplicationState;
  schemaMap: { [pluginName: string]: Manifest };
  isLoading: boolean;
  invalidStates: ApiStoreInvalidity;
  binaryMap: { [fileName: string]: string };
}

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

const LinkLabelSpan = styled.span`
  font-size: 1.1rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.linkColor};
  white-space: nowrap;
  text-decoration: underline;
`;

const TextRow = styled.div`
  display: block;
`;

const TimeTextRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  width: 400px;
`;

const ElapseText = styled.p`
  padding: 0px 4px;
  margin: 0;
  font-size: 0.9rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.repoBriefRowUpdateColor};
`;

const ElapseSince = styled.span`
  font-weight: 400;
`;

const BranchHeadNotification = styled.div`
  position: absolute;
  top: 3px;
  right: -20px;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  border: 1px solid ${ColorPalette.white};
  background: ${(props) => props.theme.colors.warningTextColor};
`;

export interface Props {
  repository: Repository;
  remoteCommitState: RemoteCommitState;
  showBackButton?: boolean;
  onGoBack?: () => void;
  onChangeBranch: (branch: Branch | null) => void;
  defaultBranchLink?: string;
  currentHeadLink?: string;
  mergeRequest?: MergeRequest|undefined;
  mergeRequestLink?: string;
  showMergeRequest?: boolean;
  isOffBranch?: boolean;
  isMerged?: boolean;
  isConflictFree?: boolean;
  isCopyMode?: boolean;
}

const RemoteCurrentInfo = (props: Props): React.ReactElement => {
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

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);

  const commitShaShort = useMemo(() => {
    if (props.repository?.branchState?.commitState?.sha) {
      return (
        props.repository?.branchState?.commitState?.sha?.substring?.(0, 4) ??
        null
      );
    }
    return null;
  }, [props.repository?.branchState?.commitState]);

  const branch = useMemo(() => {
    return props.repository?.repoBranches?.find(
      (b) => b?.id == props.repository?.branchState?.branchId
    );
  }, [props.repository?.repoBranches, props.repository?.branchState?.branchId]);

  const defaultBranchIsMatching = useMemo(() => {
    return (
      props.repository?.branchState?.defaultBranchId ==
      props.repository?.branchState?.branchId
    );
  }, [
    props.repository?.branchState?.branchId,
    props.repository?.branchState?.defaultBranchId,
  ]);

  const branchHeadIsMatching = useMemo(() => {
    if (!props?.repository?.branchState?.commitState?.sha) {
      return true;
    }
    if (
      props?.repository?.branchState?.commitState?.sha !=
      props?.repository?.branchState?.branchHead
    ) {
      return false;
    }
    return true;
  }, [props?.repository?.branchState?.commitState]);
  const baseBranch = useMemo(() => {
    if (!branch?.baseBranchId) {
      return null;
    }
    return props.repository?.repoBranches?.find(
      (b) => b?.id == branch?.baseBranchId
    );
  }, [props.repository?.repoBranches, branch]);

  const timeAgo = useMemo(() => new TimeAgo("en-US"), []);
  const elapsedTime = useMemo(() => {
    if (!props?.repository?.branchState?.commitState?.lastUpdatedAt) {
      return null;
    }
    return timeAgo.format(
      new Date(
        props?.repository?.branchState?.commitState?.lastUpdatedAt as string
      )
    );
  }, [timeAgo, props?.repository?.branchState?.commitState?.lastUpdatedAt]);


  const mergeIcon = useMemo(() => {
    if (theme.name == "light") {
      return MergeIconLight;
    }
    return MergeIconDark;
  }, [theme.name]);


  const resolveIcon = useMemo(() => {
    if (theme.name == "light") {
      return ResolveGray;
    }
    return ResolveWhite;
  }, [theme.name]);

  const abortIcon = useMemo(() => {
    if (theme.name == "light") {
      return AbortGray;
    }
    return AbortWhite;
  }, [theme.name]);

  return (
    <Container>
      <Row style={{ height: 40 }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <TitleSpan style={{ color: theme.colors.contrastTextLight }}>
            {"Repository: "}
          </TitleSpan>
          <TitleSpan
            style={{
              fontWeight: 500,
              maxWidth: 260,
              wordWrap: "break-word",
              display: "block",
              whiteSpace: "normal",
              marginLeft: 8,
              fontSize:
                (props.repository?.name?.length ?? 0) > 15
                  ? "1.5rem"
                  : "1.7rem",
            }}
          >
            {props.repository.name}
          </TitleSpan>
        </span>
        {props.showBackButton && false && (
          <GoBackIcon src={backArrowIcon} onClick={props.onGoBack} />
        )}
      </Row>
      {!props.isCopyMode && (
        <Row
          style={{
            marginBottom: 24,
          }}
        >
          <BranchSelector
            size={"mid"}
            branch={(branch as Branch) ?? null}
            branches={(props.repository?.repoBranches ?? []) as Branch[]}
            onChangeBranch={props.onChangeBranch}
          />
        </Row>
      )}
      {props.isCopyMode && (
        <Row
          style={{
            marginTop: 12,
            marginBottom: 12,
          }}
        >
          <LeftRow>
            <Icon src={branchIcon} />
            <LabelSpan>
              {"Branch"}
            </LabelSpan>
          </LeftRow>
          <RightRow>
            {branch?.name && <ValueSpan>{branch?.name}</ValueSpan>}
            {!branch?.name && <ValueSpan>{"None"}</ValueSpan>}
          </RightRow>
        </Row>
      )}
      {props?.isOffBranch && (
        <Row>
          <LeftRow>
            <Icon src={branchIcon} />
            <LabelSpan style={{ color: theme.colors.warningTextColor }}>
              {"No branch"}
            </LabelSpan>
          </LeftRow>
        </Row>
      )}
      {!props?.isOffBranch && (
        <Row>
          <LeftRow>
            <Icon src={branchIcon} />
            <LabelSpan>{"Base branch:"}</LabelSpan>
          </LeftRow>
          <RightRow>
            {baseBranch?.name && <ValueSpan>{baseBranch?.name}</ValueSpan>}
            {!baseBranch?.name && <ValueSpan>{"None"}</ValueSpan>}
          </RightRow>
        </Row>
      )}
      <Row style={{ marginTop: 12 }}>
        <LeftRow>
          <Icon src={commitIcon} />
          <LabelSpan>Commit:</LabelSpan>
        </LeftRow>
        <RightRow>
          {props.repository?.branchState?.commitState && (
            <ValueSpan>
              {commitShaShort && (
                <ValueItalicSpan style={{ marginRight: 8 }}>
                  {`(${commitShaShort})`}
                </ValueItalicSpan>
              )}
              {props.repository?.branchState?.commitState?.message}
            </ValueSpan>
          )}
          {!props.repository?.branchState?.commitState && (
            <ValueSpan>{"None"}</ValueSpan>
          )}
        </RightRow>
      </Row>
      {!props?.repository?.branchState?.commitState?.isOffBranch && baseBranch && !props.isCopyMode && (
        <Row style={{marginTop: 12}}>
          {props?.isMerged && (
            <LeftRow>
              <Icon src={mergeIcon} />
              <LabelSpan>Nothing to merge</LabelSpan>
            </LeftRow>
          )}
          {!props?.isMerged && props?.isConflictFree && (
            <LeftRow>
              <Icon src={resolveIcon} />
              <LabelSpan>No conflicts</LabelSpan>
            </LeftRow>
          )}
          {!props?.isMerged && !props?.isConflictFree && (
            <LeftRow>
              <Icon src={abortIcon} />
              <LabelSpan>Has conflicts</LabelSpan>
            </LeftRow>
          )}
        </Row>
      )}
      {(!defaultBranchIsMatching || !branchHeadIsMatching) && !props.isCopyMode && (
        <Row
          style={{
            marginTop: 12,
            marginBottom: 12,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <LeftRow>
            {branchHeadIsMatching && props.defaultBranchLink && (
              <Link to={props.defaultBranchLink}>
                <LinkLabelSpan>{"Go to default branch"}</LinkLabelSpan>
              </Link>
            )}
            {!branchHeadIsMatching && props.currentHeadLink && (
              <Link style={{ position: "relative" }} to={props.currentHeadLink}>
                {!props?.isOffBranch && (
                  <LinkLabelSpan>{"Go to branch head"}</LinkLabelSpan>
                )}
                {props?.isOffBranch && (
                  <LinkLabelSpan>{"Go to default branch head"}</LinkLabelSpan>
                )}
                <BranchHeadNotification />
              </Link>
            )}
          </LeftRow>
          {elapsedTime && (
            <TimeTextRow
              style={{
                justifyContent: "flex-end",
              }}
            >
              {branchHeadIsMatching && (
                <ElapseText>
                  {"Last committed "}
                  <ElapseSince>{elapsedTime}</ElapseSince>
                </ElapseText>
              )}
              {!branchHeadIsMatching && (
                <ElapseText>
                  {"Committed "}
                  <ElapseSince>{elapsedTime}</ElapseSince>
                </ElapseText>
              )}
            </TimeTextRow>
          )}
        </Row>
      )}
      {defaultBranchIsMatching && branchHeadIsMatching &&  !props.isCopyMode && (
        <Row style={{ marginTop: 12, marginBottom: 12, width: "100%" }}>
          {elapsedTime && (
            <TimeTextRow
              style={{
                width: "100%",
              }}
            >
              {!branchHeadIsMatching && (
                <ElapseText style={{}}>
                  {"Committed "}
                  <ElapseSince>{elapsedTime}</ElapseSince>
                </ElapseText>
              )}
              {branchHeadIsMatching && (
                <ElapseText style={{}}>
                  {"Last committed "}
                  <ElapseSince>{elapsedTime}</ElapseSince>
                </ElapseText>
              )}
            </TimeTextRow>
          )}
        </Row>
      )}
      {props?.showMergeRequest && !!props.mergeRequestLink && !props.isCopyMode && (
        <Row>
          <Link to={props.mergeRequestLink}>
            <LinkLabelSpan>{`Go to open merge request "${props?.mergeRequest?.title}" [${props?.mergeRequest?.mergeRequestCount}]`}</LinkLabelSpan>
          </Link>
        </Row>
      )}
    </Container>
  );
};

export default React.memo(RemoteCurrentInfo);
