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
import { User } from "@floro/graphql-schemas/src/generated/main-client-graphql";

const Container = styled.div`
  height: 60px;
  border-bottom: 1px solid
    ${(props) => props?.theme.colors.commonBorder};
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
  font-weight: 400;
  font-size: 1.2rem;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const Icon = styled.img`
  height: 20px;
  width: 20px;
  margin-right: 8px;
`;

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

interface Props {
  page: 'feed'|'bookmarks';
  onChangePage: (page: 'feed'|'bookmarks') => void;
  user: User;
}

const ProfileHeader = (props: Props) => {
  const theme = useTheme();
  const subscribeIcon = useMemo(() => {
    if (props.page == 'feed') {
      return SubscribeSelected;
    }
    if (theme.name == 'light') {
      return SubscribeLight;
    }
    return SubscribeDark;
  }, [theme, props.page])

  const bookmarkIcon = useMemo(() => {
    if (props.page == 'bookmarks') {
      return BookmarkSelected;
    }
    if (theme.name == 'light') {
      return BookmarkLight;
    }
    return BookmarkDark;
  }, [theme, props.page]);

  const onSelectFeed = useCallback(() => {
    props.onChangePage('feed');
  }, [props.onChangePage])

  const onSelectBookmarks = useCallback(() => {
    props.onChangePage('bookmarks');
  }, [props.onChangePage])

  const firstName = useMemo(() => {
    return upcaseFirst(props.user.firstName ?? "");
  }, [props.user.firstName])

  return (
    <Container>
      <HeaderNavCell>
        <HeaderSectionTitle onClick={onSelectFeed} style={{
          color: props.page == 'feed' ? ColorPalette.linkBlue : theme.colors.contrastText
        }}>
          <Icon src={subscribeIcon}/>
          {`${firstName}'s announcements`}
        </HeaderSectionTitle>
      </HeaderNavCell>
      <HeaderNavCell>
        <HeaderSectionTitle onClick={onSelectBookmarks} style={{
          color: props.page == 'bookmarks' ? ColorPalette.linkBlue : theme.colors.contrastText
        }}>
          <Icon src={bookmarkIcon}/>
            {`${firstName}'s bookmarks`}
        </HeaderSectionTitle>
      </HeaderNavCell>
    </Container>
  )

}

export default React.memo(ProfileHeader);