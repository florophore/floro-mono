
import React, { useMemo, useCallback, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  CommitInfo,
  MergeRequest,
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
import { useRepoLinkBase } from "../hooks/remote-hooks";
import InitialProfileDefault from "@floro/storybook/stories/common-components/InitialProfileDefault";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";

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

const StatusTitle = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
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
  &:hover {
    color: ${(props) => props.theme.colors.linkColor};
  }
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
  mergeRequest: MergeRequest;
  homeLink: string;
}
const MergeRequestHistoryRow = (props: Props) => {
  const theme = useTheme();

  const checkIcon = useMemo(() => {
    if (theme.name == "light") {
      return VerifiedLight;
    }
    return VerifiedDark;
  }, [theme.name]);

  const timeAgo = useMemo(() => new TimeAgo("en-US"), []);

  const elapsedTime = useMemo(() => {
    if (!props.mergeRequest?.createdAt) {
      return "";
    }
    return timeAgo.format(new Date(props.mergeRequest?.createdAt as string));
  }, [timeAgo, props.mergeRequest]);

  const username = useMemo(() => {
    return "@" + props.mergeRequest?.openedByUser?.username;
  }, [props.mergeRequest?.openedByUser?.username]);

  const linkBase = useRepoLinkBase(props.repository);
  const link = useMemo(() => {
    return `${linkBase}/mergerequests/${
          props.mergeRequest?.id
        }?from=remote&plugin=${"home"}`;
  }, [props.repository?.branchState, linkBase]);


  const reviewText = useMemo(() => {
    if (props?.mergeRequest?.approvalStatus == 'approved') {
      return 'approved';
    }
    if (props?.mergeRequest?.approvalStatus == 'blocked') {
      return 'blocked';
    }
    return 'pending';
  }, [props?.mergeRequest?.approvalStatus])

  const reviewColor = useMemo(() => {
    if (props?.mergeRequest?.approvalStatus == 'approved') {
      return ColorPalette.teal;
    }
    if (props?.mergeRequest?.approvalStatus == 'blocked') {
      return theme.name == "light" ? ColorPalette.red : ColorPalette.lightRed;
    }
    return ColorPalette.gray;
  }, [props?.mergeRequest?.approvalStatus, theme.name])

  const closedText = useMemo(() => {
    if (props?.mergeRequest?.wasClosedWithoutMerging) {
      return 'closed';
    }
    return 'merged';
  }, [props?.mergeRequest?.approvalStatus])

  const closeColor = useMemo(() => {
    if (props?.mergeRequest?.wasClosedWithoutMerging) {
      return theme.name == "light" ? ColorPalette.red : ColorPalette.lightRed;
    }
    return theme.name == "light" ? ColorPalette.purple : ColorPalette.lightPurple;
  }, [props?.mergeRequest?.wasClosedWithoutMerging, theme.name])

  return (
    <Container>
      <TopRow>
        <Link to={link}>
          <CommitTitle>
            {`[${props.mergeRequest.mergeRequestCount}] ` +
              props.mergeRequest.title}
          </CommitTitle>
        </Link>
        <div style={{ height: 36 }}></div>
      </TopRow>
      <ShaRow>
        {props.mergeRequest.isOpen && (
          <>
          <StatusTitle>{"Review Status: "}</StatusTitle>
          <RevertedPill style={{ marginTop: 4, marginLeft: 8, background: reviewColor }}>
            <RevertTitle>{reviewText}</RevertTitle>
          </RevertedPill>
          </>
        )}
        {!props.mergeRequest.isOpen && (
          <>
          <StatusTitle>{"Status: "}</StatusTitle>
          <RevertedPill style={{ marginTop: 4, marginLeft: 8, background: closeColor }}>
            <RevertTitle>{closedText}</RevertTitle>
          </RevertedPill>
          </>
        )}
      </ShaRow>
      <UserRow>
        <UserProfilePhoto
          offlinePhoto={null}
          user={props.mergeRequest?.openedByUser}
          size={36}
        />
        <TimeTextRow
          style={{
            justifyContent: "flex-end",
          }}
        >
          <Link to={`/user/@/${props.mergeRequest?.openedByUser?.username}`}>
            <UsernameText>{username}</UsernameText>
          </Link>
          <ElapseText>
            {"Opened "}
            <ElapseSince>{elapsedTime}</ElapseSince>
          </ElapseText>
        </TimeTextRow>
      </UserRow>
    </Container>
  );
};

export default React.memo(MergeRequestHistoryRow);
