import React, {
  useMemo,
  useCallback,
} from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";

import RepoActionButton from "@floro/storybook/stories/repo-components/RepoActionButton";
import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";
import { RemoteCommitState } from "../hooks/remote-state";
import { useSearchParams } from "react-router-dom";
import { useRepoLinkBase } from "../hooks/remote-hooks";
import { useNavigate } from "react-router";

import VerifiedLight from "@floro/common-assets/assets/images/icons/verified.light.svg";
import VerifiedDark from "@floro/common-assets/assets/images/icons/verified.dark.svg";

import RedXCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";

import TimeAgo from "javascript-time-ago";

const InnerContent = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  align-items: center;
  padding: 16px;
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  position: relative;
  align-items: center;
  padding: 24px 16px;
`;

const TitleSpan = styled.span`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.titleText};
  white-space: nowrap;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

const GoBackIcon = styled.img`
  width: 32px;
  height: 32px;
  cursor: pointer;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  margin-top: 24px;
`;

const TextAreaBlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
  min-height: 184px;
  position: relative;
  display: grid;
  width: 100%;
  margin: 0;

  &::after {
    content: attr(data-value) " ";
    visibility: hidden;
    white-space: pre-wrap;
    font-weight: 400;
    font-size: 1rem;
    display: block;
    margin-top: -38px;
  }
`;

const BlurbTextArea = styled.textarea`
  color: ${(props) => props.theme.colors.blurbBorder};
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  white-space: pre-wrap;
  resize: none;
  background: none;
  width: 100%;
  padding: 0;
  height: 184px;
  outline: none;
  border: none;
  margin: 0;
  resize: none;
  background: none;
  appearance: none;
`;

const BlurbPlaceholder = styled.span`
  color: ${(props) => props.theme.colors.blurbBorder};
  position: absolute;
  top: 0;
  left: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  left: 16px;
  top: 16px;
  pointer-events: none;
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
const UserTextRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
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

const Label = styled.span`
  display: inline;
  font-weight: 600;
  font-size: 1.2rem;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.titleText};
`;

const Value = styled.span`
  display: inline;
  margin-left: 16px;
  font-weight: 500;
  font-size: 1rem;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
`;

const BlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  overflow-y: scroll;
  padding: 16px;
  border-radius: 8px;
  height: 184px;
  width: 100%;
`;

const BlurbText = styled.span`
  color: ${(props) => props.theme.colors.blurbBorder};
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  display: block;
`;

const UserRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;
const ProfilePhoto = styled.img`
  height: 36px;
  width: 36px;
  border-radius: 50%;
`;

const UsernameText = styled.p`
  padding: 0px 4px;
  margin: 0;
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 700;
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

const ShaRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

export const getBranchIdFromName = (name: string): string => {
  return name
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll(/[[\]'"]/g, "");
};

interface Props {
  repository: Repository;
  remoteCommitState: RemoteCommitState;
  plugin: string;
  page:
    | "history"
    | "home"
    | "settings"
    | "branch-rules"
    | "merge-requests"
    | "merge-request"
    | "merge-request-review";
}

const RemoteVCSCommitHistory = (props: Props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const linkBase = useRepoLinkBase(props.repository);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("query");
  const index = searchParams.get('idx');
  const historyLink = useMemo(() => {
    let link;
    if (!props.repository?.branchState?.branchId) {
      link = `${linkBase}/history?from=remote&plugin=${
        props?.plugin ?? "home"
      }&query=${searchQuery ?? ""}`;
    }
    link = `${linkBase}/history?from=remote&branch=${
      props.repository?.branchState?.branchId
    }&plugin=${props.plugin ?? "home"}&query=${searchQuery ?? ""}`;
    if (index) {
      return link + "&idx=" + index;
    }
    return link;
  }, [props.repository?.branchState, linkBase, props.plugin, searchQuery, index]);

  const homeLink = useMemo(() => {
    if (!props.repository?.branchState?.branchId) {
      return `${linkBase}?from=remote&plugin=${props?.plugin ?? "home"}&sha=${
        props.repository?.branchState?.commitState?.sha
      }`;
    }
    return `${linkBase}?from=remote&branch=${
      props.repository?.branchState?.branchId
    }&plugin=${props.plugin ?? "home"}&sha=${
      props.repository?.branchState?.commitState?.sha
    }`;
  }, [
    props.repository?.branchState,
    props.repository?.branchState?.commitState?.sha,
    linkBase,
    props.plugin,
  ]);

  const onGoBack = useCallback(() => {
    navigate(historyLink);
  }, [historyLink]);

  const onGoHome = useCallback(() => {
    navigate(homeLink);
  }, [homeLink]);

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);

  const timeAgo = useMemo(() => new TimeAgo("en-US"), []);
  const elapsedTime = useMemo(() => {
    if (!props.repository?.branchState?.commitState?.lastUpdatedAt) {
      return "";
    }
    return timeAgo.format(
      new Date(
        props.repository?.branchState?.commitState?.lastUpdatedAt as string
      )
    );
  }, [timeAgo, props.repository?.branchState?.commitState]);

  const username = useMemo(() => {
    return "@" + props.repository?.branchState?.commitState?.user?.username;
  }, [props.repository?.branchState?.commitState?.user?.username]);

  const authorUsername = useMemo(() => {
    return (
      "@" + props.repository?.branchState?.commitState?.authorUser?.username
    );
  }, [props.repository?.branchState?.commitState?.authorUser?.username]);

  const showAuthor = useMemo(() => {
    if (!props.repository?.branchState?.commitState?.authorUser) {
      return false;
    }
    return (
      props.repository?.branchState?.commitState?.authorUser?.id !=
      props.repository?.branchState?.commitState?.user?.id
    );
  }, [
    props.repository?.branchState?.commitState?.authorUser,
    props.repository?.branchState?.commitState?.user,
  ]);

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
    if (props.repository?.branchState?.commitState?.isValid) {
      return checkIcon;
    }
    return redXIcon;
  }, [
    props.repository?.branchState?.commitState?.isValid,
    checkIcon,
    redXIcon,
  ]);

  return (
    <>
      <InnerContent>
        <TopContainer>
          <TitleRow>
            <TitleSpan
              style={{
                paddingTop: 6,
              }}
            >
              {"Selected Commit"}
            </TitleSpan>
            <div
              style={{
                paddingRight: 10,
                paddingTop: 14,
              }}
            >
              <GoBackIcon src={backArrowIcon} onClick={onGoBack} />
            </div>
          </TitleRow>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              marginTop: 16,
            }}
          >
            <UserRow style={{ justifyContent: "space-between" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <ProfilePhoto
                  style={{ marginRight: 8 }}
                  src={
                    props.repository.branchState?.commitState?.user
                      ?.profilePhoto?.thumbnailUrl ?? ""
                  }
                />
                <UserTextRow>
                  <UsernameText>{username}</UsernameText>
                </UserTextRow>
              </div>
              <TimeTextRow
                style={{
                  justifyContent: "flex-end",
                }}
              >
                <ElapseText>
                  {"Committed "}
                  <ElapseSince>{elapsedTime}</ElapseSince>
                </ElapseText>
              </TimeTextRow>
            </UserRow>
            {showAuthor && (
              <UserRow style={{ marginTop: 8 }}>
                <ProfilePhoto
                  style={{ marginRight: 8 }}
                  src={
                    props.repository.branchState?.commitState?.authorUser
                      ?.profilePhoto?.thumbnailUrl ?? ""
                  }
                />
                <UserTextRow style={{ alignItems: "center" }}>
                  <UsernameText>{authorUsername}</UsernameText>
                  <ElapseText style={{ fontSize: "1.1rem" }}>
                    {" (author)"}
                  </ElapseText>
                </UserTextRow>
              </UserRow>
            )}
            <Row
              style={{
                marginBottom: 16,
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <TextRow>
                <Label>{"Commit:"}</Label>
                <Value>
                  {props.repository.branchState?.commitState?.sha?.substring(
                    0,
                    8
                  )}
                </Value>
              </TextRow>
              <ShaRow>
                {props.repository.branchState?.commitState?.isReverted && (
                  <RevertedPill>
                    <RevertTitle>{"reverted"}</RevertTitle>
                  </RevertedPill>
                )}
                <ShaVerificationTitle
                  style={{ marginLeft: 16 }}
                  src={verificationIcon}
                />
              </ShaRow>
            </Row>
            <BlurbBox>
              <BlurbText>
                {props.repository.branchState?.commitState?.message}
              </BlurbText>
            </BlurbBox>
          </div>
          <ButtonRow style={{ marginTop: 24 }}>
            <RepoActionButton
              isDisabled={
                !props?.repository?.branchState?.commitState?.canRevert
              }
              label={"revert sha"}
              icon={"revert"}
            />
            <RepoActionButton
              label={"fix forward"}
              icon={"auto-fix"}
              isDisabled={
                !props?.repository?.branchState?.commitState?.canAutoFix
              }
            />
          </ButtonRow>
        </TopContainer>
        <BottomContainer>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Button
              onClick={onGoHome}
              label="view commit"
              bg={"purple"}
              size={"extra-big"}
            />
          </div>
        </BottomContainer>
      </InnerContent>
    </>
  );
};
export default React.memo(RemoteVCSCommitHistory);
