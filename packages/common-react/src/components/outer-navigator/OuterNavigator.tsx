import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import { useSession } from "../../session/session-context";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import { useNavigationAnimatorContext } from "../../navigation/navigation-animator";
import { useNavigate, UNSAFE_NavigationContext  } from "react-router-dom";
import { useIsOnline } from "../../hooks/offline";
import UserOrgNavigator from "./UserOrgNavigator";
import ForwardIcon from "@floro/common-assets/assets/images/icons/forward.svg";
import BackwardIcon from "@floro/common-assets/assets/images/icons/backward.svg";
import { usePageSearch } from "../search/search-hooks";
import PluginSearchResultRow from "./PluginSearchResultRow";
import OrganizationSearchResultRow from "./OrganizationSearchResultRow";
import UserSearchResultRow from "./UserSearchResultRow";
import RepoSearchResultRow from "./RepoSearchResultRow";


const Main = styled.main`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: ${(props) => props.theme.background};
  min-width: 930px;
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
  overflow-y: scroll;
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


const RightWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const NavContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 80px;
`;

const NavIcon = styled.img`
  height: 24px;
  cursor: pointer;
`;

const Container = styled.div`
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  transition: 500ms border-color;
  width: 100%;
  box-shadow: 0px 6px 6px 6px ${props => props.theme.colors.tooltipOuterShadowColor};
  margin-bottom: 16px;
`;

const InnerContainer = styled.div`
  box-shadow: inset 0 0 3px
    ${(props) => props.theme.colors.tooltipInnerShadowColor};
  padding: 8px;
  border-radius: 8px;
`;

const SearchSectionTitle = styled.h3`
  margin: 0px 0 0 0;
  padding: 0;
  font-size: 1.7rem;
  color: ${ColorPalette.gray};
  font-family: "MavenPro";
  font-weight: 600;
`;

const InstructionsText = styled.p`
  padding: 0;
  margin: 12px 0 12px 0;
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 400;
  color: ${ColorPalette.gray};
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
  const navigate = useNavigate();
  const naviationContext = React.useContext(UNSAFE_NavigationContext);
  const navIndex = useMemo(() => {
    return naviationContext?.navigator?.['index'];
  }, [naviationContext])

  const [searchResults] = usePageSearch(searchTerm);
  const [selectedIndex, setSelectedIndex] = useState<null|number>(null);

  const onGoBack = useCallback(() => {
    if (navIndex == 1) {
      return;
    }
    navigate(-1);
  }, [navigate, navIndex]);

  const onGoForward = useCallback(() => {
    navigate(1);
  }, [navigate]);

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

  const queryIsEmpty = useMemo(() => {
    return (searchTerm?.trim() ?? "") == ""
  }, [searchTerm])

  const isSearchEmpty = useMemo(() => {
    if (searchResults?.organizations?.length > 0) {
      return false;
    }
    if (searchResults?.users?.length > 0) {
      return false;
    }
    if (searchResults?.plugins?.length > 0) {
      return false;
    }
    if (searchResults?.repositories?.length > 0) {
      return false;
    }
    return true;
  }, [searchResults])

  const pluginsOffset = useMemo(
    () => Object.keys(searchResults.repositories).length,
    [searchResults.repositories]
  );

  const organizationsOffset = useMemo(
    () => Object.keys(searchResults.plugins).length + pluginsOffset,
    [searchResults.plugins, pluginsOffset]
  );

  const usersOffset = useMemo(
    () => Object.keys(searchResults.organizations).length + organizationsOffset,
    [searchResults.organizations, organizationsOffset]
  );

  const searchLength = useMemo(
    () => Object.keys(searchResults.users).length + usersOffset,
    [searchResults.users, usersOffset]
  );

  const onSelectIndex = useCallback((index: number|null) => {
    if (index == null) {
      return;
    }
    if (index < pluginsOffset) {
      const repo = searchResults.repositories[index];
      const url = `/repo/@/${repo.ownerHandle}/${repo.name}`;
      navigate(url);
      return
    }
    if (index < organizationsOffset) {
      const plugin = searchResults.plugins[index - pluginsOffset];
      const url =
        plugin.ownerType == "user_plugin"
          ? `/user/@/${plugin.user?.username}/plugins/${plugin.name}`
          : `/org/@/${plugin.organization?.handle}/plugins/${plugin.name}`;
      navigate(url);
      return
    }
    if (index < usersOffset) {
      const organization = searchResults.organizations[index - organizationsOffset];
      const url = `/org/@/${organization.handle}`;
      navigate(url);
      return
    }
    const user = searchResults.users[index - usersOffset];
      const url = `/user/@/${user.username}`;
      navigate(url);
  }, [searchResults, pluginsOffset, organizationsOffset, usersOffset, navigate]);

  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchLength == 0) {
      setSelectedIndex(null);
      return null;
    }
    if (event?.code == "ArrowUp" || event?.code == "ArrowDown") {
      event.preventDefault();
    }
    if (event?.code == "ArrowUp") {
      if (selectedIndex == null) {
        setSelectedIndex(searchLength - 1);
        return;
      }
    }
    if (event?.code == "ArrowDown") {
      if (selectedIndex == null) {
        setSelectedIndex(0);
        return;
      }
    }

    if (event?.code == "ArrowUp") {
      if (selectedIndex == 0) {
        setSelectedIndex(searchLength - 1);
        return;
      }
      setSelectedIndex((selectedIndex ?? searchLength) - 1);
      return;
    }
    if (event?.code == "ArrowDown") {
      if (selectedIndex == searchLength - 1) {
        setSelectedIndex(0);
        return;
      }
      setSelectedIndex((selectedIndex ?? -1) + 1);
      return;
    }
    if (event?.code == "Enter") {
      onSelectIndex(selectedIndex);
      searchRef.current?.blur();
    }
  }, [selectedIndex, searchResults, searchLength, onSelectIndex]);

  const onTextChanged = useCallback((text) => {
    setSearchTerm(text)
    setSelectedIndex(null);
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
          <OfflineIndicatorWrapper style={{ bottom: offlineBottom }}>
            <OfflineText>{"offline!"}</OfflineText>
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
            <RightWrapper>
              <div style={{ marginRight: 24 }}>
                <NavContainer>
                  <NavIcon src={BackwardIcon} onClick={onGoBack} />
                  <NavIcon src={ForwardIcon} onClick={onGoForward} />
                </NavContainer>
              </div>
              <SearchInput
                placeholder="search repos, orgs, plugins..."
                value={searchTerm}
                onTextChanged={onTextChanged}
                onKeyDown={onKeyDown}
                onFocus={onFocusSearch}
                onBlur={onBlurSearch}
                ref={searchRef}
              />
              {isSearchFocused && (
                <div
                  style={{
                    width: 512,
                    display: "block",
                    textAlign: "left",
                    position: "absolute",
                    right: 18,
                    top: 64,
                    zIndex: 2,
                  }}
                >
                  <Container>
                    <InnerContainer>
                      {isSearchFocused && !isSearchEmpty && !queryIsEmpty && (
                        <>
                          {searchResults?.repositories?.length >0 && (
                            <div>
                              <SearchSectionTitle>
                                {"Repositories"}
                              </SearchSectionTitle>
                              <div style={{padding: 8}}>
                                {searchResults?.repositories?.map((repoResult, index) => {
                                  return (
                                    <div
                                    onMouseDown={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      onSelectIndex(index)
                                    }}
                                    onMouseOver={() => {
                                      setSelectedIndex(index);
                                    }}
                                    key={index}>
                                      <RepoSearchResultRow
                                        repoResult={repoResult}
                                        isSelected={index == selectedIndex}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {searchResults?.plugins?.length > 0 && (
                            <div>
                              <SearchSectionTitle>{"Plugins"}</SearchSectionTitle>
                              <div style={{padding: 8}}>
                                {searchResults?.plugins?.map((plugin, index) => {
                                  return (
                                    <div key={index}
                                      onMouseDown={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        onSelectIndex(pluginsOffset + index)
                                      }}
                                      onMouseOver={() => {
                                        setSelectedIndex(pluginsOffset + index);
                                      }}
                                    >
                                      <PluginSearchResultRow
                                        plugin={plugin}
                                        isSelected={(pluginsOffset + index) == selectedIndex}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {searchResults?.organizations?.length > 0 && (
                            <div>
                              <SearchSectionTitle>
                                {"Organizations"}
                              </SearchSectionTitle>
                              <div style={{padding: 8}}>
                                {searchResults?.organizations?.map((organization, index) => {
                                  return (
                                    <div key={index}
                                      onMouseDown={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        onSelectIndex(organizationsOffset + index)
                                      }}
                                      onMouseOver={() => {
                                        setSelectedIndex(organizationsOffset + index);
                                      }}
                                    >
                                      <OrganizationSearchResultRow
                                        organization={organization}
                                        isSelected={(organizationsOffset + index) == selectedIndex}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {searchResults?.users?.length > 0 && (
                            <div>
                              <SearchSectionTitle>{"Users"}</SearchSectionTitle>
                              <div style={{padding: 8}}>
                                {searchResults?.users?.map((user, index) => {
                                  return (
                                    <div key={index}
                                      onMouseDown={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        onSelectIndex(usersOffset + index)
                                      }}
                                      onMouseOver={() => {
                                        setSelectedIndex(usersOffset + index);
                                      }}
                                    >
                                      <UserSearchResultRow
                                        user={user}
                                        isSelected={(usersOffset + index) == selectedIndex}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {isSearchEmpty && !queryIsEmpty && (
                        <InstructionsText>
                          {
                            'No results found...'
                          }
                        </InstructionsText>
                      )}

                      {queryIsEmpty && (
                        <InstructionsText>
                          {
                            'Search for repositories, plugins, organizations, and users. To search users and organizations by handle, prefix your query with "@".'
                          }
                        </InstructionsText>
                      )}
                    </InnerContainer>
                  </Container>
                </div>
              )}
            </RightWrapper>
          </SearchWrapper>
        </header>

        <BottomContainer>
          {currentUser && (
            <UserOrgNavigator
              outerNavTab={props.outerNavTab}
              page={props.page}
              organizationId={props?.organizationId}
            />
          )}
          <Content>{props?.children}</Content>
        </BottomContainer>
      </Main>
    </motion.div>
  );
};

export default React.memo(OuterNavigator);