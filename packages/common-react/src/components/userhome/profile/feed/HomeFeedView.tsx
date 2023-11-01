
import React, { useCallback, useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import BookmarkLight from "@floro/common-assets/assets/images/icons/bookmark.light.svg";
import BookmarkDark from "@floro/common-assets/assets/images/icons/bookmark.dark.svg";
import BookmarkSelected from "@floro/common-assets/assets/images/icons/bookmark.blue.svg";

import SubscribeLight from "@floro/common-assets/assets/images/icons/subscribe.light.svg";
import SubscribeDark from "@floro/common-assets/assets/images/icons/subscribe.dark.svg";
import SubscribeSelected from "@floro/common-assets/assets/images/icons/subscribe.selected.svg";

import NotificationLight from "@floro/common-assets/assets/images/icons/notification.light.svg";
import NotificationDark from "@floro/common-assets/assets/images/icons/notification.dark.svg";
import NotificationSelected from "@floro/common-assets/assets/images/icons/notification.selected.svg";
import HomeFeedHeader from "./HomeFeedHeader";
import NewPluginsView from "./NewPluginsView";
import NewReposView from "./NewReposView";
import FeedAnnouncements from "./FeedAnnouncements";
import { useSearchParams } from "react-router-dom";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
`;


interface Props {
}

const HomeFeedView = (props: Props) => {
  const [searchParams, setSearchParams] = useSearchParams({});

  const setFeedOption = useCallback((feedOption: 'announcements'|'new_plugins'|'new_repos') => {
    setSearchParams({
      feed_option: feedOption
    });
  }, [setSearchParams])

  const feedOption = useMemo(() => {
    if (searchParams.get('feed_option') == 'new_plugins') {
      return 'new_plugins';
    }
    if (searchParams.get('feed_option') == 'new_repos') {
      return 'new_repos';
    }
    return 'announcements';
  }, [searchParams])

  return (
    <Container>
      <HomeFeedHeader
        feedOption={feedOption}
        onChangeFeedOption={setFeedOption}
      />
      {feedOption == 'new_plugins' && <NewPluginsView/>}
      {feedOption == 'new_repos' && <NewReposView/>}
      {feedOption == 'announcements' && <FeedAnnouncements/>}
    </Container>
  );

}

export default React.memo(HomeFeedView);