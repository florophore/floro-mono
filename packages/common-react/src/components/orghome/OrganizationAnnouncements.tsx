import React, { useMemo, useEffect, useCallback, useState, useRef } from "react";
import styled from "@emotion/styled";
import {
  Organization,
  RepoAnnouncement,
  useFetchOrgRepoAnnouncementsLazyQuery,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import RepoAnnouncementDisplay from "../repo_announcements/RepoAnnouncementDisplay";
import ColorPalette from "@floro/styles/ColorPalette";
import throttle from "lodash.throttle";

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex: 1;
  position: relative;
`;

const ScrollContainer = styled.div`
  max-height: 100%;
  height: 100%;
  width: 100%;
  overflow-y: scroll;
  position: absolute;
  top: 0;
  left: 0;
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
  width: 80%;
  max-width: 450px;
  margin-top: -80px;
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
`;

const LoadMore = styled.h5`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.44rem;
  color: ${(props) => props.theme.colors.linkColor};
  text-decoration: underline;
  cursor: pointer;
`;

const NoAnnouncementsTitle = styled.h5`
  font-family: "MavenPro";
  color: ${ColorPalette.gray};
  font-weight: 500;
  font-size: 1.4rem;
`;

interface Props {
  organization: Organization;
}

const findFirstChar = (str: string) => {
  for (let i = 0; i < str.length; ++i) {
    if (/[A-z]/.test(str[i])) return str[i].toUpperCase();
  }
  return "";
};

const upcaseFirst = (str: string) => {
  const firstChar = findFirstChar(str);
  const pos = str.toLowerCase().indexOf(firstChar.toLowerCase());
  return firstChar + str.substring(pos + 1);
};

const OrganizationAnnouncements = (props: Props) => {
  const [repoAnnouncements, setRepoAnnouncements] = useState<
    RepoAnnouncement[]
  >([]);
  const [lastId, setLastId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [fetch, fetchAnnouncementsQuery] = useFetchOrgRepoAnnouncementsLazyQuery();

  const displayName = useMemo(() => upcaseFirst(props?.organization?.name ?? ""), [props.organization?.name]);

  useEffect(() => {
    fetch({
      variables: {
        organizationId: props.organization?.id as string
      },
      fetchPolicy: "network-only",
    });
  }, [props.organization?.id]);

  useEffect(() => {
    if (
      fetchAnnouncementsQuery.data?.fetchOrgRepoAnnouncements?.__typename ==
      "FetchRepoAnnouncementsResult"
    ) {
      const ids = new Set(
        fetchAnnouncementsQuery.data?.fetchOrgRepoAnnouncements?.announcements?.map(
          (a) => a?.id
        ) ?? []
      );
      setRepoAnnouncements(
        [
          ...repoAnnouncements.filter((a) => !ids.has(a.id) && !a.isDeleted),
          ...((fetchAnnouncementsQuery.data?.fetchOrgRepoAnnouncements.announcements ??
            []) as Array<RepoAnnouncement>),
        ].sort((a: RepoAnnouncement, b: RepoAnnouncement) => {
          return new Date(a?.createdAt ?? "") >= new Date(b?.createdAt ?? "")
            ? -1
            : 1;
        })
      );
      if (
        repoAnnouncements[0]?.id !=
        fetchAnnouncementsQuery.data?.fetchOrgRepoAnnouncements.announcements?.[0]?.id
      ) {
        setHasMore(fetchAnnouncementsQuery.data?.fetchOrgRepoAnnouncements.hasMore ?? false);
        setLastId(fetchAnnouncementsQuery.data?.fetchOrgRepoAnnouncements.lastId ?? null);
      }
    }
  }, [fetchAnnouncementsQuery.data]);

  const onRepoAnnouncementDeleted = useCallback(
    (repoAnnouncement: RepoAnnouncement) => {
      setRepoAnnouncements(
        repoAnnouncements.filter(
          (a) => a.id != repoAnnouncement.id && !a.isDeleted
        )
      );
    },
    [repoAnnouncements]
  );

  const onLoadMore = useCallback(() => {
    if (hasMore && lastId) {
      fetch({
        variables: {
          lastId,
          organizationId: props.organization?.id as string
        },
        fetchPolicy: "network-only",
      });
    }
  }, [lastId, hasMore, props.organization?.id]);

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

  if (!fetchAnnouncementsQuery?.loading && repoAnnouncements.length == 0) {

    return (
      <InsufficientPermssionsContainer>
        <InsufficientPermssionsTextWrapper>
          <NoAnnouncementsTitle style={{textAlign: 'center', fontSize: '1.7rem'}}>
            {
              `${displayName} hasn't posted any announcements to their repositories yet.`
            }
          </NoAnnouncementsTitle>
        </InsufficientPermssionsTextWrapper>
      </InsufficientPermssionsContainer>
    );
  }

  return (
    <Container>
      <ScrollContainer>
        <InnerContainer onScroll={scrollThrottled}>
          {repoAnnouncements.map((repoAnnouncement, index) => {
            return (
              <RepoAnnouncementDisplay
                key={index}
                repoAnnouncement={repoAnnouncement}
                onDelete={onRepoAnnouncementDeleted}
              />
            );
          })}
          {!fetchAnnouncementsQuery?.loading && repoAnnouncements.length == 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                flexGrow: 1,
                height: "calc(100% - 160px)",
              }}
            >
              <InsufficientPermssionsContainer>
                <InsufficientPermssionsTextWrapper>
                  <InsufficientPermssionsText>
                    {"no announcements to display"}
                  </InsufficientPermssionsText>
                </InsufficientPermssionsTextWrapper>
              </InsufficientPermssionsContainer>
            </div>
          )}

          {!fetchAnnouncementsQuery?.loading && hasMore && (
            <LoadMoreWrapper style={{ maxWidth: 870 }}>
              <LoadMore onClick={onLoadMore}>
                {"load more announcements"}
              </LoadMore>
            </LoadMoreWrapper>
          )}
          {fetchAnnouncementsQuery?.loading && (
            <LoadMoreWrapper style={{ maxWidth: repoAnnouncements.length == 0 ? '100%' : 870 }}>
              <DotsLoader size="medium" color="linkBlue" />
            </LoadMoreWrapper>
          )}
        </InnerContainer>
      </ScrollContainer>
    </Container>
  );
};

export default React.memo(OrganizationAnnouncements);
