import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import { useSession } from "../../session/session-context";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import { useNavigationAnimatorContext } from "../../navigation/navigation-animator";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import OrgProfilePhoto from "@floro/storybook/stories/common-components/OrgProfilePhoto";
import { useOfflinePhoto } from "../../offline/OfflinePhotoContext";
import { useIsOnline } from "../../hooks/offline";
import { Organization, useCurrentUserHomeQuery } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import UserOrgNavigator from "./UserOrgNavigator";

const Main = styled.main`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: ${(props) => props.theme.background};
`;

const headerCss = css`
  display: flex;
  flex-direction: row;
  height: 72px;
  width: 100%;
  background: ${ColorPalette.purple};
  padding: 16px;
  margin: 0;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const Title = styled.div`
  margin: 16px 0 0 0;
  padding: 0;
  font-size: 1.44rem;
  color: ${ColorPalette.white};
  font-family: "MavenPro";
  font-weight: 600;
  -webkit-app-region: no-drag;
  cursor: arrow;
`;

const SearchWrapper = styled.div`
  user-select: none;
  -webkit-app-region: no-drag;
  cursor: arrow;
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  flex-grow: 1;
`;
const Navigator = styled.main`
  width: 72px;
  border-right: 1px solid ${ColorPalette.lightPurple};
  padding: 0;
  margin: 0;
  position: relative;
  background: ${(props) => props.theme.background};
`;

const NavOptionHighlight = styled.div`
  z-index: 0;
  position: absolute;
  top: 0px;
  left: 0px;
  height: 72px;
  width: 72px;
  background: ${ColorPalette.lightPurple};
`;

const DragFill = styled.div`
  flex: 1;
  height: 100%;
  -webkit-app-region: drag;
  cursor: drag;
`;

const NavOptionList = styled.div`
  z-index: 0;
  width: 72px;
  display: flex;
  flex-direction: column;
`;
const NavOption = styled.div`
  z-index: 0;
  height: 72px;
  width: 72px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  position: relative;
  background: ${props => props.theme.background};
`;

const Drag = css`
  -webkit-app-region: drag;
  cursor: drag;
`;

const OfflineIndicatorWrapper = styled.div`
  position: absolute;
  left: calc(50% - 72px);
  background-color: ${props => props.theme.colors.offlineWarningTabColor};
  height: 36px;
  width: 144px;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: bottom 300ms;
`;

const OfflineText = styled.span`
  color: ${ColorPalette.white};
  font-weight: 600;
  font-size: 1.2rem;
  font-family: "MavenPro";
  text-align: center;
`;

const mainVariants = {
  open: {
    right: 0,
  },
  closed: {
    right: "-100%",
  },
};

export interface Props {
  page: string;
  children: React.ReactElement;
  title?: React.ReactElement | string;
  organizationId?: string|null;
  outerNavTab: string;
}
const OuterNavigator = (props: Props) => {
  const { currentUser } = useSession();
  const isOnline = useIsOnline();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  const offlineBottom = useMemo(() => {
    if (isOnline) {
      return -36;
    }
    return 0;
  }, [isOnline])

  const onFocusSearch = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const onBlurSearch = useCallback(() => {
    setIsSearchFocused(false);
  }, []);

  const onMouseOverSearch = useCallback(() => {
    setIsDragEnabled(false);
  }, []);

  const onMouseLeaveSearch = useCallback(() => {
    setIsDragEnabled(true);
  }, []);

  const dragClass = useMemo(() => {
    if (isDragEnabled) {
      return [Drag];
    }
    return [];
  }, [isDragEnabled]);

  const theme = useTheme();
  const navigationAnimator = useNavigationAnimatorContext();

  useEffect(() => {
    const listener = (e) => {
      if (
        e.keyCode === 114 ||
        (e.ctrlKey && e.keyCode === 70) ||
        e.keyCode === 114 ||
        (e.ctrlKey && e.keyCode === 70) ||
        (e.metaKey && e.keyCode === 70)
      ) {
        searchRef?.current?.focus?.();
      }
    };
    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    }
  }, []);

  return (
    <motion.div
      style={{
        position: "absolute",
        width: "100%",
        background: theme.background,
      }}
      initial={{
        right: navigationAnimator.dashboardView ? "0%" : "-100%",
      }}
      animate={navigationAnimator.dashboardView ? "open" : "closed"}
      transition={{ duration: 0.5 }}
      variants={mainVariants}
    >
      <Main>
        <header className={css([...dragClass, headerCss])}>
          <OfflineIndicatorWrapper style={{bottom: offlineBottom}}>
            <OfflineText>{'offline!'}</OfflineText>
          </OfflineIndicatorWrapper>
          <Title
            onMouseEnter={onMouseOverSearch}
            onMouseLeave={onMouseLeaveSearch}
          >
            {props.title}
          </Title>
          <DragFill />
          <SearchWrapper
            onMouseEnter={onMouseOverSearch}
            onMouseLeave={onMouseLeaveSearch}
          >
            <SearchInput
              placeholder="search repos, users, plugins..."
              value={searchTerm}
              onTextChanged={setSearchTerm}
              onFocus={onFocusSearch}
              onBlur={onBlurSearch}
              ref={searchRef}
            />
          </SearchWrapper>
        </header>

        <BottomContainer>
          {currentUser &&
            <UserOrgNavigator outerNavTab={props.outerNavTab} page={props.page} organizationId={props?.organizationId}/>
          }
          <Content>{props?.children}</Content>
        </BottomContainer>
      </Main>
    </motion.div>
  );
};

export default React.memo(OuterNavigator);