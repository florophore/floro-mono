import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import styled from "@emotion/styled";
import ModalBackdrop from "../ModalBackdrop";
import ColorPalette from "@floro/styles/ColorPalette";
import SearchInput from "../../design-system/SearchInput";
import ExitIconLight from "@floro/common-assets/assets/images/icons/exit_icon.light.svg";
import ExitIconDark from "@floro/common-assets/assets/images/icons/exit_icon.dark.svg";
import { useTheme } from "@emotion/react";
import { Plugin } from "@floro/graphql-schemas/build/generated/main-client-graphql";
import FindPluginSearchDropdown from "../FindPluginSearchDropdown";

const Container = styled.div`
  width: 960px;
  height: 800px;
  box-shadow: ${(props) =>
    `0px 8px 40px ${props.theme.shadows.modalContainer}`};
  position: relative;
  border-radius: 10px;
  background: ${(props) => props.theme.background};
`;

const ModalHeaderContainer = styled.div`
  background: ${ColorPalette.purple};
  height: 80px;
  width: 100%;
  box-sizing: border-box;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  display: flex;
  flex-direction: row;
  padding: 16px 24px;
  justify-content: space-between;
  align-items: center;
`;

const ModalSubContainer = styled.div`
    height: height: 100%;
    flex: 1;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const ModalTitle = styled.h3`
    text-align: center;
    align-self: center;
    font-family: "MavenPro";
    font-size: 2rem;
    font-weight: 500;
    margin: 0;
    padding: 0;
    color: ${ColorPalette.white};
`

const ButtonWrapper = styled.div`
    height: 100%;
    width: 160px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: flex-end;
    align-self: flex-end;
    padding: 8px 16px;
    box-sizing: border-box;
`;

const BottomContainer = styled.div`
  background: ${props => props.theme.background};
  height: 720px;
  width: 100%;
  box-sizing: border-box;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  position: relative;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    width: 4px;
    background: ${props => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: ${props => props.theme.background};
  }
`;

const ExitIconImage = styled.img`
  height: 40px;
  width: 40px;
  cursor: pointer;
`;

const SearchDropdownContainer = styled.div`
    position: absolute;
    left: 26px;
    top: 64px;
    z-index: 1;
`;

export interface CropArea {
    height: number;
    width: number;
    x: number;
    y: number;
}

export interface Props {
  show: boolean;
  onDismiss?: () => void;
  query: string;
  onUpdateQueryText: (query: string) => void;
  pluginResults: Plugin[]
  isLoading: boolean;
  children: React.ReactElement;
  onSelectPlugin?: (plugin: Plugin) => void;
  plugin?: Plugin;
}

const FindPluginModal = ({
  show,
  onDismiss,
  query,
  onUpdateQueryText,
  pluginResults,
  isLoading,
  onSelectPlugin,
  plugin,
  children
}: Props): React.ReactElement => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const bottomContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (plugin?.name && bottomContainer.current) {
      bottomContainer.current.scrollTo({top: 0, behavior: 'smooth'});
    }
  }, [plugin?.name])

  useEffect(() => {
    if (show) {
      if (searchRef.current) {
        searchRef.current.focus();
      }
    }
  }, [show]);

  const exitIconSrc = useMemo(() => {
    if (theme.name == "light") {
      return ExitIconLight;
    }
    return ExitIconDark;
  }, [theme.name]);

  const onFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  }, []);

  const [selectedPlugin, setSelectedPlugin] = useState<Plugin|undefined>(undefined);

  const onHoverSelectedPlugin = useCallback((plugin: Plugin) => {
    setSelectedPlugin(plugin);
  }, []);

  const onClickSelectedPlugin = useCallback((plugin: Plugin) => {
    setSelectedPlugin(plugin);
    onUpdateQueryText(plugin?.name ?? "");
    onSelectPlugin?.(plugin);
  }, [onUpdateQueryText, onSelectPlugin]);

  const [cachedPlugins, setCachedPlugins] = useState<Array<Plugin>>([]);

  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (pluginResults.length == 0) {
      return;
    }
    if (event.code == "ArrowDown") {
      event.preventDefault();
      if (!selectedPlugin) {
        setSelectedPlugin(pluginResults[0]);
        return;
      }
      let selectedIndex = 0;
      for (; selectedIndex < pluginResults.length; ++selectedIndex) {
        if (pluginResults[selectedIndex].id == selectedPlugin.id) {
          break;
        }
      }
      if (selectedIndex == pluginResults.length - 1) {
        setSelectedPlugin(pluginResults[0]);
        return;
      }
      setSelectedPlugin(pluginResults[selectedIndex + 1]);
      return;
    }
    if (event.code == "ArrowUp") {
      event.preventDefault();
      if (!selectedPlugin) {
        setSelectedPlugin(pluginResults[pluginResults.length - 1]);
        return;
      }
      let selectedIndex = 0;
      for (; selectedIndex < pluginResults.length; ++selectedIndex) {
        if (pluginResults[selectedIndex].id == selectedPlugin.id) {
          break;
        }
      }
      if (selectedIndex == 0) {
        setSelectedPlugin(pluginResults[pluginResults.length - 1]);
        return;
      }
      setSelectedPlugin(pluginResults[selectedIndex - 1]);
      return;
    }

    if (event.code == "Enter" && selectedPlugin) {
      if (searchRef.current) {
        searchRef.current.blur?.();
        onUpdateQueryText(selectedPlugin?.name ?? "");
        onSelectPlugin?.(selectedPlugin);
      }
    }
  }, [pluginResults, selectedPlugin, onUpdateQueryText]);

  useEffect(() => {
    if (pluginResults && !isLoading) {
      setCachedPlugins(pluginResults);
      setSelectedPlugin(undefined);
    }
  }, [pluginResults]);

  return (
    <div>
      <ModalBackdrop show={show} disableBackgroundDismiss={true}>
        <Container>
          <ModalHeaderContainer>
            <SearchInput
              ref={searchRef}
              value={query}
              placeholder={"search plugins"}
              onTextChanged={onUpdateQueryText}
              onFocus={onFocus}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
            />
            <ExitIconImage src={exitIconSrc} onClick={onDismiss} />
          </ModalHeaderContainer>
          <BottomContainer ref={bottomContainer}>{children}</BottomContainer>
          <SearchDropdownContainer>
            {isFocused && (query.length > 0) &&
              <FindPluginSearchDropdown
                plugins={isLoading ? cachedPlugins : pluginResults}
                isLoading={false}
                onHoverPlugin={onHoverSelectedPlugin}
                onClickPlugin={onClickSelectedPlugin}
                selectedPlugin={selectedPlugin}
              />
            }
          </SearchDropdownContainer>
        </Container>
      </ModalBackdrop>
    </div>
  );
};

export default React.memo(FindPluginModal);
