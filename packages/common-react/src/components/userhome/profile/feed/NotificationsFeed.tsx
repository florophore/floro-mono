import React, { useMemo, useEffect, useCallback, useState, useRef } from "react";
import styled from "@emotion/styled";
import {
  Notification,
  RepoAnnouncement,
  Repository,
  useFetchFeedLazyQuery,
  useFetchFeedQuery,
  useFetchNotificationsLazyQuery,
  useFetchRepoAnnouncementsLazyQuery,
  useFetchRepoAnnouncementsQuery,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import RepoAnnouncementDisplay from "../../../repo_announcements/RepoAnnouncementDisplay";
import ColorPalette from "@floro/styles/ColorPalette";
import throttle from "lodash.throttle";
import NotificationDisplay from "../notifications/NotificationDisplay";

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

interface Props {}

const NotificationsFeed = (props: Props) => {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);
  const [lastId, setLastId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [fetch, fetchNotificationsQuery] = useFetchNotificationsLazyQuery();

  useEffect(() => {
    fetch({
      fetchPolicy: "network-only",
    });
  }, []);

  useEffect(() => {
    if (
      fetchNotificationsQuery.data?.fetchNotifications?.__typename ==
      "FetchNotificationsResult"
    ) {
      const ids = new Set(
        fetchNotificationsQuery.data?.fetchNotifications?.notifications?.map(
          (a) => a?.id
        ) ?? []
      );
      setNotifications(
        [
          ...notifications.filter((a) => !ids.has(a.id) && !a.isDeleted),
          ...((fetchNotificationsQuery.data?.fetchNotifications.notifications ??
            []) as Array<Notification>),
        ].sort((a: Notification, b: Notification) => {
          return new Date(a?.createdAt ?? "") >= new Date(b?.createdAt ?? "")
            ? -1
            : 1;
        })
      );
      if (
        notifications[0]?.id !=
        fetchNotificationsQuery.data?.fetchNotifications.notifications?.[0]?.id
      ) {
        setHasMore(fetchNotificationsQuery.data?.fetchNotifications?.hasMore ?? false);
        setLastId(fetchNotificationsQuery.data?.fetchNotifications.lastId ?? null);
      }
    }
  }, [fetchNotificationsQuery.data]);


  const onLoadMore = useCallback(() => {
    if (hasMore && lastId) {
      fetch({
        variables: {
          lastId,
        },
        fetchPolicy: "network-only",
      });
    }
  }, [lastId, hasMore]);

  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    if (notifications.length == 0) {
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
  }, [notifications, onLoadMore]);

  const scrollThrottled = useCallback(
    throttle(onScroll, 50),
    [onScroll]
  );

  if (!fetchNotificationsQuery?.loading && notifications.length == 0) {

    return (
      <InsufficientPermssionsContainer>
        <InsufficientPermssionsTextWrapper>
          <NoAnnouncementsTitle style={{textAlign: 'center', fontSize: '1.7rem'}}>
            {
              "No notifications to display."
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
          {notifications.map((notification, index) => {
            return (
              <NotificationDisplay key={index} notification={notification} />
            );
          })}
          {!fetchNotificationsQuery?.loading && notifications.length == 0 && (
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
                    {"no notifications to display"}
                  </InsufficientPermssionsText>
                </InsufficientPermssionsTextWrapper>
              </InsufficientPermssionsContainer>
            </div>
          )}

          {!fetchNotificationsQuery?.loading && hasMore && (
            <LoadMoreWrapper style={{ maxWidth: 870 }}>
              <LoadMore onClick={onLoadMore}>
                {"load more notifications"}
              </LoadMore>
            </LoadMoreWrapper>
          )}
          {fetchNotificationsQuery?.loading && (
            <LoadMoreWrapper style={{ maxWidth: notifications.length == 0 ? '100%' : 870 }}>
              <DotsLoader size="medium" color="linkBlue" />
            </LoadMoreWrapper>
          )}
        </InnerContainer>
      </ScrollContainer>
    </Container>
  );
};

export default React.memo(NotificationsFeed);
