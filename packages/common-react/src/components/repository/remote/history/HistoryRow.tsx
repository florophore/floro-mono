import React, { useMemo, useCallback, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  CommitInfo,
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import { RemoteCommitState } from "../hooks/remote-state";
import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en";
import Button from "@floro/storybook/stories/design-system/Button";

import VerifiedLight from "@floro/common-assets/assets/images/icons/verified.light.svg";
import VerifiedDark from "@floro/common-assets/assets/images/icons/verified.dark.svg";

import RedXCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import ColorPalette from "@floro/styles/ColorPalette";
import { Link } from "react-router-dom";
import InitialProfileDefault from "@floro/storybook/stories/common-components/InitialProfileDefault";
import { useSearchParams} from "react-router-dom";
import { useRepoLinkBase } from "../hooks/remote-hooks";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  border-radius: 8px;
  padding: 8px;
  margin-top: 24px;
`;

const TopRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const ShaRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-top: 8px;
`;

const CommitTitle = styled.div`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.linkColor};
  text-decoration: underline;
  max-width: 650px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  cursor: pointer;
`;

const ShaTitle = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  font-style: italic;
  color: ${(props) => props.theme.colors.contrastText};
`;

const ShaVerificationTitle = styled.img`
  height: 24px;
  width: 24px;
`;

const RevertedPill = styled.div`
  height: 24px;
  width: 100px;
  border-radius: 12px;
  background: ${(props) => props.theme.colors.revertedBackground};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const RevertTitle = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1rem;
  color: ${ColorPalette.white};
`;

const UserRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-top: 16px;
`;

const ProfilePhoto = styled.img`
  height: 36px;
  width: 36px;
  border-radius: 50%;
`;

const TimeTextRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  margin-left: 8px;
`;

const UsernameText = styled.p`
  padding: 0px 4px;
  margin: 0;
  font-size: 1rem;
  font-family: "MavenPro";
  font-weight: 700;
  color: ${(props) => props.theme.colors.contrastText};
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

interface Props {
  repository: Repository;
  remoteCommitState: RemoteCommitState;
  commit: CommitInfo;
  homeLink: string;
  onSelect?: (sha: string, idx: number) => void;
  hideSelect?: boolean;
  plugin?: string;
  isMergeRequest?: boolean;
}
const HistoryRow = (props: Props) => {
  const theme = useTheme();

  const [searchParams] = useSearchParams();
  const index = searchParams.get('idx');
  const searchQuery = searchParams.get("query");
  const linkBase = useRepoLinkBase(props.repository);

  const historyLink = useMemo(() => {
    if (!props.repository?.branchState?.branchId) {
      return `${linkBase}/history?from=remote&plugin=${props?.plugin ?? "home"}&query=${searchQuery ?? ""}`;
    }
    return `${linkBase}/history?from=remote&branch=${
      props.repository?.branchState?.branchId
    }&plugin=${props.plugin ?? "home"}&query=${searchQuery ?? ""}`;
  }, [props.repository?.branchState, linkBase, props.plugin, searchQuery]);

  const mrShaLink = useMemo(() => {
    return (linkBase + "?from=remote&sha=" + props?.commit?.sha);
  }, [historyLink, index, props?.commit?.sha]);

  const shaLink = useMemo(() => {
    if (!index) {
      return (historyLink + "&sha=" + props?.commit?.sha);
    } else {
      return (historyLink + "&sha=" + props?.commit?.sha + "&idx=" + index);
    }
  }, [historyLink, index, props?.commit?.sha]);

  const shaTitle = useMemo(() => {
    return `(${props.commit.sha?.substring(0, 6)})`;
  }, [props.commit.sha]);

  const checkIcon = useMemo(() => {
    if (theme.name == "light") {
      return VerifiedLight;
    }
    return VerifiedDark;
  }, [theme.name]);

  const redXIcon = useMemo(() => {
    if (theme.name == "light") {
      return RedXCircleLight;
    }
    return RedXCircleDark;
  }, [theme.name]);

  const verificationIcon = useMemo(() => {
    if (props.commit.isValid) {
      return checkIcon;
    }
    return redXIcon;
  }, [props.commit.isValid, checkIcon, redXIcon]);

  const timeAgo = useMemo(() => new TimeAgo("en-US"), []);

  const elapsedTime = useMemo(() => {
    if (!props.commit?.updatedAt) {
      return "";
    }
    return timeAgo.format(new Date(props.commit?.updatedAt as string));
  }, [timeAgo, props.commit]);

  const username = useMemo(() => {
    return "@" + props.commit?.username;
  }, [props.commit?.username]);

  const authorUsername = useMemo(() => {
    return "@" + props.commit?.authorUsername;
  }, [props.commit?.authorUsername]);

  const showAuthor = useMemo(() => {
    if (!props.commit?.authorUser) {
        return false;
    }
    return props.commit?.authorUser?.id != props.commit?.user?.id;
  }, [props.commit?.authorUser, props.commit?.user]);

  const onClickSelect = useCallback(() => {
    if (props.commit?.sha) {
        props.onSelect?.(props.commit?.sha, props.commit?.idx ?? 0);
    }

  }, [props.onSelect, props.commit?.sha])

  return (
    <Container>
      <TopRow>
        <Link to={props?.isMergeRequest ? mrShaLink : shaLink}>
          <CommitTitle>{props.commit?.message}</CommitTitle>
        </Link>
        {!props.hideSelect && (
          <Button
            onClick={onClickSelect}
            label={"select"}
            bg={"purple"}
            size={"small"}
          />
        )}
        {props.hideSelect && (
          <div style={{height: 36}}></div>
        )}
      </TopRow>
      <ShaRow>
        <ShaTitle>{shaTitle}</ShaTitle>
        <ShaVerificationTitle
          style={{ marginLeft: 16 }}
          src={verificationIcon}
        />
        {props.commit?.isReverted && (
          <RevertedPill style={{ marginLeft: 16 }}>
            <RevertTitle>{"reverted"}</RevertTitle>
          </RevertedPill>
        )}
      </ShaRow>
      <UserRow>
        {props.commit?.user?.profilePhoto?.thumbnailUrl && (
          <ProfilePhoto
            src={props.commit?.user?.profilePhoto?.thumbnailUrl ?? ""}
          />
        )}
        {!props.commit?.user?.profilePhoto?.thumbnailUrl && (
          <InitialProfileDefault
            size={36}
            firstName={props.commit?.user?.firstName ?? ""}
            lastName={props.commit?.user?.lastName ?? ""}
          />
        )}
        <TimeTextRow
          style={{
            justifyContent: "flex-end",
          }}
        >
          <UsernameText>{username}</UsernameText>
          <ElapseText>
            {"Committed "}
            <ElapseSince>{elapsedTime}</ElapseSince>
          </ElapseText>
        </TimeTextRow>
        {showAuthor && (
          <>
            {props.commit?.authorUser?.profilePhoto?.thumbnailUrl && (
              <ProfilePhoto
                style={{ marginLeft: 16 }}
                src={props.commit?.authorUser?.profilePhoto?.thumbnailUrl ?? ""}
              />
            )}
            {!props.commit?.authorUser?.profilePhoto?.thumbnailUrl && (
              <InitialProfileDefault
                size={36}
                firstName={props.commit?.authorUser?.firstName ?? ""}
                lastName={props.commit?.authorUser?.lastName ?? ""}
              />
            )}
            <TimeTextRow
              style={{
                justifyContent: "flex-end",
              }}
            >
              <ElapseText>{"Authored by "}</ElapseText>
              <UsernameText>{authorUsername}</UsernameText>
            </TimeTextRow>
          </>
        )}
      </UserRow>
    </Container>
  );
};

export default React.memo(HistoryRow);
