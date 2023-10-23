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

const Container = styled.div`
  height: 42px;
  border-bottom: 1px solid
    ${(props) => props?.theme.colors.sidebarTitleTextColor};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const HeaderNavCell= styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  flex-direction: row;
`;

const HeaderSectionTitle = styled.h5`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastText};
  font-weight: 500;
  font-size: 1.2rem;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: color 100ms, font-weight 100ms;
`;

const Icon = styled.img`
  height: 20px;
  width: 20px;
  margin-right: 8px;
`;

interface Props {
  feedOption: 'psa'|'new_plugins'|'new_repos';
  onChangeFeedOption: (feedOption: 'psa'|'new_plugins'|'new_repos') => void;
}

const HomeFeedHeader = (props: Props) => {
  const theme = useTheme();

  const onSelectFeed = useCallback(() => {
    props.onChangeFeedOption('psa');
  }, [props.onChangeFeedOption])

  const onSelectBookmarks = useCallback(() => {
    props.onChangeFeedOption('new_plugins');
  }, [props.onChangeFeedOption])

  const onSelectNotifications = useCallback(() => {
    props.onChangeFeedOption('new_repos');
  }, [props.onChangeFeedOption])


  return (
    <Container>
      <HeaderNavCell>
        <HeaderSectionTitle onClick={onSelectFeed} style={{
          color: props.feedOption == 'psa' ? theme.colors.sidebarTitleTextColor : theme.colors.contrastText,
          fontWeight: props.feedOption == 'psa' ? 600 : 400
        }}>
          {'announcements'}
        </HeaderSectionTitle>
      </HeaderNavCell>
      <HeaderNavCell>
        <HeaderSectionTitle onClick={onSelectBookmarks} style={{
          color: props.feedOption == 'new_plugins' ? theme.colors.sidebarTitleTextColor : theme.colors.contrastText,
          fontWeight: props.feedOption == 'new_plugins' ? 600 : 400
        }}>
          {'new plugins'}
        </HeaderSectionTitle>
      </HeaderNavCell>
      <HeaderNavCell>
        <HeaderSectionTitle onClick={onSelectNotifications} style={{
          color: props.feedOption == 'new_repos' ? theme.colors.sidebarTitleTextColor : theme.colors.contrastText,
          fontWeight: props.feedOption == 'new_repos' ? 600 : 400
        }}>
          {'new repositories'}
        </HeaderSectionTitle>
      </HeaderNavCell>
    </Container>
  )

}

export default React.memo(HomeFeedHeader);