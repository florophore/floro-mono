import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  RepoAnnouncement,
  Repository,
  useCreateRepoAnnouncementMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Button from "@floro/storybook/stories/design-system/Button";

import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";
import RichTextEditor from "@floro/storybook/stories/design-system/RichTextEditor";
import { useRepoLinkBase } from "../hooks/remote-hooks";
import { useNavigate } from "react-router";
import { useCreateAnnouncementsContext } from "../announcements/CreateAnnouncementsContext";

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

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

interface Props {
  repository: Repository;
  plugin: string;
}

const RemoteVCSAnnouncements = (props: Props) => {
  const theme = useTheme();
  const [text, setText] = useState("");

  const { triggerCreateRepoAnnouncement } = useCreateAnnouncementsContext();
  const [create, createRequest] = useCreateRepoAnnouncementMutation();

  const navigate = useNavigate();
  const linkBase = useRepoLinkBase(props.repository);
  const settingsLink = useMemo(() => {
    return `${linkBase}?from=remote&plugin=${props.plugin ?? "home"}`;
  }, [linkBase, props.plugin]);

  const onGoBack = useCallback(() => {
    navigate(settingsLink);
  }, [settingsLink]);

  const isDisabled = useMemo(() => {
    return text.trim() == "";
  }, [text])

  const onCreate = useCallback(() => {
    if (!props.repository.id) {
      return null;
    }
    create({
      variables: {
        repositoryId: props.repository.id,
        text
      }
    })

  }, [text, props.repository.id]);

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);

  useEffect(() => {
    if (createRequest?.data?.createRepoAnnouncementComment?.__typename == "CreateRepoAnnouncementSuccess") {
      setText("");
      triggerCreateRepoAnnouncement(
        createRequest?.data?.createRepoAnnouncementComment
          ?.repoAnnouncement as RepoAnnouncement
      );
      createRequest.reset();
    }
  }, [createRequest?.data])

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
              {"Announcements"}
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
          {props.repository.repoPermissions?.canWriteAnnouncements && (
            <div
              style={{
                marginTop: 24,
                width: "100%",
                height: "calc(100vh - 178px)",
              }}
            >
              <RichTextEditor
                content={text}
                onSetContent={setText}
                maxHeight={400}
                placeholder="write a new announcement"
              />
            </div>
          )}
        </TopContainer>
        <BottomContainer>
          {props.repository.repoPermissions?.canWriteAnnouncements && (
            <ButtonRow style={{ marginTop: 24 }}>
              <Button
                onClick={onCreate}
                isLoading={createRequest.loading}
                isDisabled={isDisabled}
                label="post annoucement"
                bg={"purple"}
                size={"extra-big"}
              />
            </ButtonRow>
          )}
        </BottomContainer>
      </InnerContent>
    </>
  );
};
export default React.memo(RemoteVCSAnnouncements);
