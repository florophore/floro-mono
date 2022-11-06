import React, { useState, useCallback, useMemo } from "react";
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { css } from '@emotion/css';
import { DarkTheme } from "@floro/styles/ColorThemes";
import ColorPalette from "@floro/styles/ColorPalette";
import { useSession } from "../../session/session-context";
import InitialProfileDefault from '@floro/storybook/stories/common-components/InitialProfileDefault';
import SearchInput from '@floro/storybook/stories/design-system/SearchInput';


const Main = styled.main`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
`;

const headerCss = css`
    display: flex;
    flex-direction: row;
    height: 72px;
    width: 100%;
    background: ${ColorPalette.purple};
    padding: 14px;
    margin: 0;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    position: relative;
`;

const Title = styled.p`
    margin: 16px 0 0 0;
    padding: 0;
    font-size: 1.44rem;
    color: ${ColorPalette.white};
    font-family: "MavenPro";
    font-weight: 600;
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
    background:  ${props => props.theme.background};
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
`

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
`;

const Drag = css`
    -webkit-app-region: drag;
    cursor: drag;
`;


const mainVariants = {
    open: {
        right: 0,
    },
    closed: {
        right: '-100%',
    },
};

export interface Props {
  isOpen: boolean;
  children: React.ReactElement;
  title?: React.ReactElement|string;
}
const OuterNavigator = (props: Props) => {

  const { currentUser } = useSession();
  const [searchTerm, setSearchTerm ] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(true);

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

  return (
      <motion.div
        style={{
          position: 'absolute',
          width: '100%',
        }}
        initial={{
          right: '-100%',
        }}
        exit={{
          right: '100%',
        }}
        animate={props.isOpen ? 'open' : 'closed'}
        transition={{duration: 0.5}}
        variants={mainVariants}
      >
        <Main>
            <header className={css([...dragClass, headerCss])}>
              <Title>
                {props.title}
              </Title>
              <DragFill/>
              <SearchWrapper onMouseEnter={onMouseOverSearch} onMouseLeave={onMouseLeaveSearch}>
                <SearchInput placeholder="search repos, users, plugins..." value={searchTerm} onTextChanged={setSearchTerm} onFocus={onFocusSearch} onBlur={onBlurSearch}/>
              </SearchWrapper>
            </header>

            <BottomContainer>
                <Navigator>
                  <NavOptionHighlight/>
                  <NavOptionList>
                    <NavOption>
                      <InitialProfileDefault firstName={currentUser?.firstName ?? ""} lastName={currentUser?.lastName ?? ""} size={56}/>
                    </NavOption>
                  </NavOptionList>
                </Navigator>
                <Content>
                    {props?.children}
                </Content>
            </BottomContainer>
        </Main>
    </motion.div>
  );
};

export default React.memo(OuterNavigator);