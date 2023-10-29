import React, {
  useEffect,
  useCallback,
  useState
} from "react";
import styled from "@emotion/styled";
import {
  RepoAnnouncement,
  Repository,
  useFetchRepoAnnouncementsLazyQuery,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import { useSubscribeCreateRepoAnnouncement } from "./CreateAnnouncementsContext";
import RepoAnnouncementDisplay from "../../../repo_announcements/RepoAnnouncementDisplay";
import throttle from "lodash.throttle";

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

const AnnouncementsDisplay = (props: Props) => {

  const [repoAnnouncements, setRepoAnnouncements] = useState<RepoAnnouncement[]>([])
  const [lastId, setLastId] = useState<string|null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [fetch, fetchAnnouncementsQuery] = useFetchRepoAnnouncementsLazyQuery()

  useEffect(() => {
    if (props.repository.id) {
        fetch({
            variables: {
                repositoryId: props.repository.id
            },
            fetchPolicy: 'cache-and-network'
        });
    }
  }, [props.repository.id])

  useEffect(() => {
    if (fetchAnnouncementsQuery.data?.fetchRepoAnnouncements?.__typename == "FetchRepoAnnouncementsResult") {
        const ids = new Set(
          fetchAnnouncementsQuery.data?.fetchRepoAnnouncements?.announcements?.map(
            (a) => a?.id
          ) ?? []
        );
        setRepoAnnouncements([
          ...repoAnnouncements.filter(a => !ids.has(a.id) && !a.isDeleted),
          ...((fetchAnnouncementsQuery.data?.fetchRepoAnnouncements
            .announcements ?? []) as Array<RepoAnnouncement>),
        ].sort((a: RepoAnnouncement, b: RepoAnnouncement) => {
          return (new Date(a?.createdAt ?? "") >= new Date(b?.createdAt ?? "") ? -1 : 1);
        }));
        if (
          repoAnnouncements[0]?.id !=
          fetchAnnouncementsQuery.data?.fetchRepoAnnouncements
            .announcements?.[0]?.id
        ) {
          setHasMore(
            fetchAnnouncementsQuery.data?.fetchRepoAnnouncements.hasMore ??
              false
          );
          setLastId(
            fetchAnnouncementsQuery.data?.fetchRepoAnnouncements.lastId ?? null
          );
        }
    }

  }, [fetchAnnouncementsQuery.data])

  const onRepoAnnouncementAdded = useCallback((repoAnnouncement: RepoAnnouncement) => {
    setRepoAnnouncements([repoAnnouncement, ...repoAnnouncements]);
  }, [repoAnnouncements, props.repository]);
  useSubscribeCreateRepoAnnouncement(onRepoAnnouncementAdded);

  const onRepoAnnouncementDeleted = useCallback((repoAnnouncement: RepoAnnouncement) => {
    setRepoAnnouncements(repoAnnouncements.filter(a => a.id != repoAnnouncement.id && !a.isDeleted));
  }, [repoAnnouncements]);

  const onLoadMore = useCallback(() => {
    if (hasMore && lastId && props.repository.id) {

        fetch({
            variables: {
                repositoryId: props.repository.id,
                lastId
            },
            fetchPolicy: 'cache-and-network'
        });
    }

  }, [lastId, hasMore]);

  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    if (repoAnnouncements.length == 0) {
      return;
    }

    const scrollTop = event.currentTarget?.scrollTop ?? 0;
    const scrollHeight = event.currentTarget?.scrollHeight ?? 0;
    const clientHeight = event.currentTarget?.clientHeight ?? 0;
    const totalScrollTop = scrollTop + clientHeight;
    if (scrollHeight == 0 || totalScrollTop == 0) {
      return;
    }
    if (totalScrollTop > (scrollHeight - 600)) {
      onLoadMore()
    }
  }, [repoAnnouncements, onLoadMore]);

  const scrollThrottled = useCallback(
    throttle(onScroll, 50),
    [onScroll]
  );


  if (props.isLoading) {
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
      <InnerContainer onScroll={scrollThrottled}>
        <TitleContainer style={{marginBottom: 48}}>
          <Title>{"Repository Announcements"}</Title>
        </TitleContainer>
        {repoAnnouncements.map((repoAnnouncement, index) => {
            return (
                <RepoAnnouncementDisplay
                    key={index}
                    repoAnnouncement={repoAnnouncement}
                    onDelete={onRepoAnnouncementDeleted}
                />
            )
        })}
        {!fetchAnnouncementsQuery?.loading &&  repoAnnouncements.length == 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            height: 'calc(100% - 160px)'
          }}>
            <InsufficientPermssionsContainer>
              <InsufficientPermssionsTextWrapper>
                <InsufficientPermssionsText>
                  {'no announcements to display'}
                </InsufficientPermssionsText>
              </InsufficientPermssionsTextWrapper>
            </InsufficientPermssionsContainer>

          </div>

        )}

        <LoadMoreWrapper>
          {!fetchAnnouncementsQuery?.loading &&
            hasMore && (
              <LoadMore onClick={onLoadMore}>{"load more announcements"}</LoadMore>
            )}
          {fetchAnnouncementsQuery?.loading && (
            <DotsLoader size="medium" color="linkBlue" />
          )}
        </LoadMoreWrapper>
      </InnerContainer>
    </Container>
  );
};

export default React.memo(AnnouncementsDisplay);