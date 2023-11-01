import React, {
  useEffect,
  useCallback,
  useState
} from "react";
import styled from "@emotion/styled";
import {
  RepoAnnouncement,
  Repository,
  useClearRepoAnnouncementNotificationsMutation,
  useFetchRepoAnnouncementQuery,
  useFetchRepoAnnouncementsLazyQuery,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import { useSubscribeCreateRepoAnnouncement } from "./CreateAnnouncementsContext";
import RepoAnnouncementDisplay from "../../../repo_announcements/RepoAnnouncementDisplay";
import throttle from "lodash.throttle";
import { useParams } from "react-router-dom";

const Container = styled.div`
  height: 100%;
  max-width: 100%;
  user-select: text;
  ::-webkit-scrollbar {
    width: 4px;
    background: ${(props) => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: ${(props) => props.theme.background};
  }
`;

const InnerContainer = styled.div`
  padding: 16px 40px 80px 24px;
  overflow-y: scroll;
  height: 100%;
`;

const TitleContainer = styled.div`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const ApiConfigText = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.linkColor};
  text-decoration: underline;
`;

const InsufficientPermssionsContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: center;
  justify-content: center;
  align-items: center;
`;

const InsufficientPermssionsTextWrapper = styled.div`
  width: 50%;
  max-width: 450px;
  flex-direction: center;
  justify-content: center;
`;

const InsufficientPermssionsText = styled.h3`
  font-weight: 600;
  font-size: 2.5rem;
  font-family: "MavenPro";
  text-align: center;
  color: ${(props) => props.theme.colors.contrastText};
`;

const LoadMoreWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 72px;
  max-width: 870px;
`;

const LoadMore = styled.h5`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.44rem;
  color: ${props => props.theme.colors.linkColor};
  text-decoration: underline;
  cursor: pointer;
`;

interface Props {
  repository: Repository;
  plugin: string;
  isLoading: boolean;
}

const AnnouncementDisplay = (props: Props) => {
  const params = useParams();
  const { data, loading, refetch } = useFetchRepoAnnouncementQuery({
    variables: {
        repoAnnouncementId: params['repoAnnouncementId'] as string
    }
  });

  const [clearNotification] = useClearRepoAnnouncementNotificationsMutation();

  useEffect(() => {
    if (
      data?.fetchRepoAnnouncement?.__typename ==
        "FetchRepoAnnouncementResult" &&
      data?.fetchRepoAnnouncement?.repoAnnouncement?.id
    ) {
      clearNotification({
        variables: {
          repoAnnouncementId: data?.fetchRepoAnnouncement?.repoAnnouncement?.id
        },
      });
    }

  }, [data?.fetchRepoAnnouncement?.__typename])



  if (loading || props.isLoading) {
    return (
      <InsufficientPermssionsContainer>
        <InsufficientPermssionsTextWrapper>
          <InsufficientPermssionsText>
            <DotsLoader size={"medium"} color={"purple"}/>
          </InsufficientPermssionsText>
        </InsufficientPermssionsTextWrapper>
      </InsufficientPermssionsContainer>
    );
  }

  return (
    <Container>
      <InnerContainer>
        <TitleContainer style={{ marginBottom: 48 }}>
          <Title>{"Repository Announcement"}</Title>
        </TitleContainer>
        {data?.fetchRepoAnnouncement?.__typename == "FetchRepoAnnouncementResult" && data?.fetchRepoAnnouncement?.repoAnnouncement && (
          <RepoAnnouncementDisplay
            repoAnnouncement={data?.fetchRepoAnnouncement?.repoAnnouncement as RepoAnnouncement}
            onDelete={() => {
              refetch()
            }}
          />
        )
        }
        {!loading && (data?.fetchRepoAnnouncement?.__typename != "FetchRepoAnnouncementResult" || !data?.fetchRepoAnnouncement?.repoAnnouncement) && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
              height: "calc(100% - 160px)",
            }}
          >
            <InsufficientPermssionsContainer>
              <InsufficientPermssionsTextWrapper>
                <InsufficientPermssionsText>
                  {"annoucement not found"}
                </InsufficientPermssionsText>
              </InsufficientPermssionsTextWrapper>
            </InsufficientPermssionsContainer>
          </div>
        )}
      </InnerContainer>
    </Container>
  );
};

export default React.memo(AnnouncementDisplay);