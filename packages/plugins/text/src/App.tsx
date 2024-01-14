import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import { useSelectedTheme } from "@floro/common-web/src/hooks/color-theme";
import "./index.css";
import {
  FloroProvider,
  useClientStorageApi,
  useExtractQueryArgs,
  useFloroContext,
  useFloroState,
  useReferencedObject,
} from "./floro-schema-api";
import TextAppHeader from "./header/TextAppHeader";
import LocalesSections from "./locales/LocalesSections";
import PhraseGroups from "./phrasegroups/PhraseGroups";
import TermGlossaryHeader from "./header/TermGlossaryHeader";
import TermList from "./terms/TermList";
import DeepLProvider from "./deepl/DeepLContext";
import TranslationMemoryProvider from "./memory/TranslationMemoryContext";
import ChatGPTProvider from "./chatgpt/ChatGPTContext";
import DisplayHeader from "./header/DisplayHeader";
import Chevron from "@floro/common-assets/assets/images/icons/chevron.dark.svg";

const Container = styled.div`
  width: 100%;
  padding: 24px 24px 24px 24px;
  flex: 1;
  overflow-y: scroll;
  position: relative;

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

const ScrollTopButton = styled.div`
  height: 60px;
  width: 60px;
  position: absolute;
  bottom: 0px;
  right: 64px;
  background: ${props => props.theme.colors.titleText};
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 0px 6px 6px ${props => props.theme.shadows.outerDropdown};
  z-index: 1;
  pointer-events: all;
`;

const ChevronImage = styled.img`
  height: 24px;
  width: 24px;
  cursor: pointer;
  transition: transform 300ms;
`;

const BottomFloat = styled.div`
  position: fixed;
  bottom: 96px;
  left: 0;
  height: 880px;
  pointer-events: none;
  width: 100%;
  min-width: 1040px;
`;

const InnerFloatContainer = styled.div`
  height: calc(100% - 80px);
  width: calc(100% - 48px);
  position: absolute;
  left: 24px;
  top: 0px;
  background: ${props => props.theme.background};
  border-radius: 8px;
  box-shadow: 0px 0px 6px 6px ${props => props.theme.shadows.outerDropdown};
  pointer-events: all;

`;

const Layout = () => {
  const container = useRef<HTMLDivElement>(null);
  const { commandMode, pluginState, applicationState, clientStorage } =
    useFloroContext();
  const clientStorageEnabled = clientStorage != null;
  const [searchText, setSearchText] = useState<string>("");
  const [searchTextState, setSearchTextState] = useState<string>("");
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [searchTermText, setSearchTermText] = useState<string>("");
  const [isEditGroups, setIsEditGroups] = useState<boolean>(false);
  const [showLocales, setShowLocales] = useState<boolean>(false);
  const [showEditTerms, setShowEditTerms] = useState<boolean>(false);

  const [phraseGroups, setPhraseGroups, savePhraseGroups] =
    useFloroState("$(text).phraseGroups") ?? [];

  const localeSettings = useReferencedObject("$(text).localeSettings");
  const locales = useReferencedObject("$(text).localeSettings.locales");
  const terms = useReferencedObject("$(text).terms");
  const localeCodes = useMemo(
    () => new Set(locales?.map((l) => l.localeCode)),
    [locales]
  );
  const [defaultLocaleCode] = useExtractQueryArgs(
    localeSettings?.defaultLocaleRef
  );
  const [lastSelectedLocale, setLastSelectedLocale] =
    useClientStorageApi<string>("top-level-locale");
  const [showOnlyPinnedPhrases, setShowOnlyPinnedPhrases] =
    useClientStorageApi<boolean>("show-only-pinned-phrases");
  const [showOnlyPinnedTerms, setShowOnlyPinnedTerms] =
    useClientStorageApi<boolean>("show-only-pinned-terms");
  const [pinnedGroups, setPinnedGroups, removePinnedGroups] =
    useClientStorageApi<Array<string>>("pinned-groups");
  const [pinnedPhrases, setPinnedPhrases, removePinnedPhrases] =
    useClientStorageApi<Array<string>>("pinned-phrases");
  const [pinnedTerms, setPinnedTerms, removePinnedTerms] =
    useClientStorageApi<Array<string>>("pinned-terms");
  const [selectedTopLevelLocale, setSelectedTopLevelLocale] =
    useState(defaultLocaleCode);
  const [globalFilterUntranslated, setGlobalFilterUnstranslated] =
    useState(false);
  const [globalFilterRequiresUpdate, setGlobalFilterRequiresUpdate] =
    useState(false);
  const [globalFilterUntranslatedTerms, setGlobalFilterUnstranslatedTerms] =
    useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const [hidePhrases, setHidePhrases] =
    useClientStorageApi<boolean>("hide-phrases");

  const onTogglePhrases = useCallback(() => {
    setHidePhrases(!hidePhrases);
  }, [hidePhrases, setHidePhrases]);

  const [hideTerms, setHideTerms] =
    useClientStorageApi<boolean>("hide-terms");

  const onToggleTerms = useCallback(() => {
    setHideTerms(!hideTerms);
  }, [hideTerms, setHideTerms]);


  useEffect(() => {
    if (!!lastSelectedLocale) {
      setSelectedTopLevelLocale(
        lastSelectedLocale && localeCodes.has(lastSelectedLocale)
          ? lastSelectedLocale
          : defaultLocaleCode
      );
    }
  }, [!!lastSelectedLocale]);

  useEffect(() => {
    if (!selectedTopLevelLocale && defaultLocaleCode) {
      setSelectedTopLevelLocale(defaultLocaleCode);
    }
  }, [selectedTopLevelLocale, defaultLocaleCode]);

  const onShowEditGroups = useCallback(() => {
    setIsEditGroups(true);
  }, []);

  const onHideEditGroups = useCallback(() => {
    setIsEditGroups(false);
  }, []);

  const onShowLocales = useCallback(() => {
    setShowLocales(true);
  }, []);

  const onHideLocales = useCallback(() => {
    setShowLocales(false);
  }, []);

  const onShowEditTerms = useCallback(() => {
    setShowEditTerms(true);
  }, []);

  const onHideEditTerms = useCallback(() => {
    setShowEditTerms(false);
  }, []);

  const onChangeTopLevelLocale = useCallback(
    (locale: string) => {
      setLastSelectedLocale(locale);
      setSelectedTopLevelLocale(locale);
    },
    [setSelectedTopLevelLocale, setLastSelectedLocale, applicationState]
  );

  const colorTheme = useSelectedTheme(pluginState?.themeName ?? 'light');

  const onScrollUp = useCallback(() => {
    if (container.current) {
      container.current.scrollTo({top: 0, behavior: "smooth"})
    }
  }, [])

  return (
    <ThemeProvider theme={colorTheme}>
      <ChatGPTProvider>
        <DeepLProvider>
          <TranslationMemoryProvider>
            <Container ref={container}>
              {false && (
                <DisplayHeader
                  hidePhrases={hidePhrases}
                  onTogglePhrases={onTogglePhrases}
                  hideTerms={hideTerms}
                  onToggleTerms={onToggleTerms}
                  selectedTopLevelLocale={selectedTopLevelLocale as string}
                  setSelectedTopLevelLocale={onChangeTopLevelLocale}
                  isEditLocales={showLocales}
                  onShowEditLocales={onShowLocales}
                  onHideEditLocales={onHideLocales}
                />
              )}
              {showLocales && <LocalesSections />}
              {!hidePhrases && (
                <>
                  {false && (
                    <TextAppHeader
                      isEditGroups={isEditGroups}
                      onShowEditGroups={onShowEditGroups}
                      onHideEditGroups={onHideEditGroups}
                      searchText={searchText ?? ""}
                      onSetSearchText={setSearchText}
                      selectedTopLevelLocale={selectedTopLevelLocale as string}
                      setSelectedTopLevelLocale={onChangeTopLevelLocale}
                      globalFilterUntranslated={globalFilterUntranslated}
                      setGlobalFilterUnstranslated={setGlobalFilterUnstranslated}
                      globalFilterRequiresUpdate={globalFilterRequiresUpdate}
                      setGlobalFilterRequiresUpdate={setGlobalFilterRequiresUpdate}
                      filterTag={filterTag}
                      setFilterTag={setFilterTag}
                      showOnlyPinnedPhrases={showOnlyPinnedPhrases ?? false}
                      setShowOnlyPinnedPhrases={setShowOnlyPinnedPhrases}
                      pinnedPhrases={pinnedPhrases}
                      setPinnedPhrases={setPinnedPhrases}
                      removePinnedPhrases={removePinnedPhrases}
                      searchTextState={searchTextState}
                      onSetSearchTextState={setSearchTextState}
                      phraseGroups={phraseGroups ?? []}
                      setPhraseGroups={setPhraseGroups}
                    />
                  )}
                  {container.current && (
                    <PhraseGroups
                      selectedTopLevelLocale={selectedTopLevelLocale}
                      globalFilterUntranslated={globalFilterUntranslated}
                      globalFilterRequiresUpdate={globalFilterRequiresUpdate}
                      searchText={searchText}
                      isEditingGroups={isEditGroups}
                      filterTag={filterTag}
                      showOnlyPinnedPhrases={
                        (showOnlyPinnedPhrases ?? false) && clientStorageEnabled
                      }
                      pinnedPhrases={pinnedPhrases}
                      setPinnedPhrases={setPinnedPhrases}
                      removePinnedPhrases={removePinnedPhrases}
                      scrollContainer={container.current}
                      phraseGroups={phraseGroups ?? []}
                      setPhraseGroups={setPhraseGroups}
                      savePhraseGroups={savePhraseGroups}
                      pinnedPhrasesWithGroups={[]}
                    />
                  )}
                </>
              )}
              {false && !hideTerms && ((terms?.length ?? 0) > 0 || commandMode == "edit") && (
                <>
                  <TermGlossaryHeader
                    onSetSearchTermText={setSearchTermText}
                    searchTermText={searchTermText}
                    isEditTerms={showEditTerms}
                    onShowEditTerms={onShowEditTerms}
                    onHideEditTerms={onHideEditTerms}
                    globalFilterUntranslatedTerms={globalFilterUntranslatedTerms}
                    setGlobalFilterUnstranslatedTerms={
                      setGlobalFilterUnstranslatedTerms
                    }
                    showOnlyPinnedTerms={showOnlyPinnedTerms ?? false}
                    setShowOnlyPinnedTerms={setShowOnlyPinnedTerms}
                    pinnedTerms={pinnedTerms}
                    setPinnedTerms={setPinnedPhrases}
                    removePinnedTerms={removePinnedTerms}
                    selectedTopLevelLocale={selectedTopLevelLocale}
                  />
                  <TermList
                    searchTermText={searchTermText}
                    isEditTerms={showEditTerms}
                    selectedTopLevelLocale={selectedTopLevelLocale}
                    globalFilterUntranslatedTerms={globalFilterUntranslatedTerms}
                    showOnlyPinnedTerms={showOnlyPinnedTerms ?? false}
                    pinnedTerms={pinnedTerms}
                    setPinnedTerms={setPinnedTerms}
                    removePinnedTerms={removePinnedTerms}
                  />
                </>
              )}
              {/*false && (
                <BottomFloat style={{
                  pointerEvents: isHovering ? 'all' : 'none',
                  height: 880
                }} onMouseLeave={() => {
                  setIsHovering(false);
                }}>
                  {isHovering && (
                    <InnerFloatContainer onMouseLeave={() => {
                  setIsHovering(false);
                }}>
                  <div style={{padding: 24}}>
                    <DisplayHeader
                      hidePhrases={hidePhrases}
                      onTogglePhrases={onTogglePhrases}
                      hideTerms={hideTerms}
                      onToggleTerms={onToggleTerms}
                      selectedTopLevelLocale={selectedTopLevelLocale as string}
                      setSelectedTopLevelLocale={onChangeTopLevelLocale}
                      isEditLocales={showLocales}
                      onShowEditLocales={onShowLocales}
                      onHideEditLocales={onHideLocales}
                    />

                    {!hidePhrases && (
                      <TextAppHeader
                        isEditGroups={isEditGroups}
                        onShowEditGroups={onShowEditGroups}
                        onHideEditGroups={onHideEditGroups}
                        searchText={searchText ?? ""}
                        onSetSearchText={setSearchText}
                        selectedTopLevelLocale={selectedTopLevelLocale as string}
                        setSelectedTopLevelLocale={onChangeTopLevelLocale}
                        globalFilterUntranslated={globalFilterUntranslated}
                        setGlobalFilterUnstranslated={setGlobalFilterUnstranslated}
                        globalFilterRequiresUpdate={globalFilterRequiresUpdate}
                        setGlobalFilterRequiresUpdate={setGlobalFilterRequiresUpdate}
                        filterTag={filterTag}
                        setFilterTag={setFilterTag}
                        showOnlyPinnedPhrases={showOnlyPinnedPhrases ?? false}
                        setShowOnlyPinnedPhrases={setShowOnlyPinnedPhrases}
                        pinnedPhrases={pinnedPhrases}
                        setPinnedPhrases={setPinnedPhrases}
                        removePinnedPhrases={removePinnedPhrases}
                        searchTextState={searchTextState}
                        onSetSearchTextState={setSearchTextState}
                        phraseGroups={phraseGroups ?? []}
                        setPhraseGroups={setPhraseGroups}
                      />
                    )}
                    {!hideTerms && ((terms?.length ?? 0) > 0 || commandMode == "edit") && (
                      <>
                        <TermGlossaryHeader
                          onSetSearchTermText={setSearchTermText}
                          searchTermText={searchTermText}
                          isEditTerms={showEditTerms}
                          onShowEditTerms={onShowEditTerms}
                          onHideEditTerms={onHideEditTerms}
                          globalFilterUntranslatedTerms={globalFilterUntranslatedTerms}
                          setGlobalFilterUnstranslatedTerms={
                            setGlobalFilterUnstranslatedTerms
                          }
                          showOnlyPinnedTerms={showOnlyPinnedTerms ?? false}
                          setShowOnlyPinnedTerms={setShowOnlyPinnedTerms}
                          pinnedTerms={pinnedTerms}
                          setPinnedTerms={setPinnedPhrases}
                          removePinnedTerms={removePinnedTerms}
                          selectedTopLevelLocale={selectedTopLevelLocale}
                        />
                      </>
                    )}
                  </div>

                    </InnerFloatContainer>
                  )}
                  <ScrollTopButton onClick={onScrollUp} onMouseEnter={() => {
                    setIsHovering(true);
                  }}>
                    <ChevronImage src={Chevron} style={{
                      transform: `rotate(${isHovering ? '-90deg' : '-180deg'})`
                    }}/>
                  </ScrollTopButton>
                </BottomFloat>
                  )*/}
            </Container>
          </TranslationMemoryProvider>
        </DeepLProvider>
      </ChatGPTProvider>
    </ThemeProvider>
  );
};

function App() {
  return (
    <FloroProvider>
      <Layout />
    </FloroProvider>
  );
}

export default App;
