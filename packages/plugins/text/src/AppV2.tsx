import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import { useSelectedTheme } from "@floro/common-web/src/hooks/color-theme";
import "./index.css";
import {
  FloroProvider,
  PointerTypes,
  extractQueryArgs,
  getReferencedObject,
  makeQueryRef,
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
import HeaderV2 from "./headerv2/HeaderV2";
import {
  filterPinnedPhraseGroups,
  getFilteredPhrasesGroups,
} from "./phrasegroups/filterhooks";
import FocusView from "./focusview/FocusView";
import { FocusProvider } from "./focusview/FocusContext";

const Container = styled.div`
  width: 100%;
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
const Inner = styled.div`
  /*padding: 24px 24px 24px 24px;*/
`;

const ScrollTopButton = styled.div`
  height: 60px;
  width: 60px;
  position: absolute;
  bottom: 0px;
  right: 64px;
  background: ${(props) => props.theme.colors.titleText};
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 0px 6px 6px ${(props) => props.theme.shadows.outerDropdown};
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
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  box-shadow: 0px 0px 6px 6px ${(props) => props.theme.shadows.outerDropdown};
  pointer-events: all;
`;

const Layout = () => {
  const container = useRef<HTMLDivElement>(null);
  const { commandMode, pluginState, applicationState, clientStorage } =
    useFloroContext();
  const clientStorageEnabled = clientStorage != null;
  const [page, setPage] = useState<"phrases" | "terms" | "locales">("phrases");
  const [searchText, setSearchText] = useState<string>("");
  const [searchTextState, setSearchTextState] = useState<string>("");
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [searchTermText, setSearchTermText] = useState<string>("");
  const [isEditGroups, setIsEditGroups] = useState<boolean>(false);
  const [showLocales, setShowLocales] = useState<boolean>(false);
  const [showEditTerms, setShowEditTerms] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

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
  const [showOnlyPinnedGroups, setShowOnlyPinnedGroups] =
    useClientStorageApi<boolean>("show-only-pinned-groups");
  const [showOnlyPinnedPhrases, setShowOnlyPinnedPhrases] =
    useClientStorageApi<boolean>("show-only-pinned-phrases");
  const [showOnlyPinnedTerms, setShowOnlyPinnedTerms] =
    useClientStorageApi<boolean>("show-only-pinned-terms");
  const [pinnedPhrases, setPinnedPhrases, removePinnedPhrases] =
    useClientStorageApi<Array<string>>("pinned-phrases");
  const [pinnedTerms, setPinnedTerms, removePinnedTerms] =
    useClientStorageApi<Array<string>>("pinned-terms");
  const [pinnedGroups, setPinnedGroups, removePinnedGroups] =
    useClientStorageApi<Array<string>>("pinned-groups");
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

  const [hideTerms, setHideTerms] = useClientStorageApi<boolean>("hide-terms");

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

  const colorTheme = useSelectedTheme(pluginState?.themeName ?? "light");

  const pinnedPhrasesWithGroups = useMemo(() => {
    if (!applicationState) {
      return [];
    }
    return (
      pinnedPhrases
        ?.map((phraseKey) => {
          const [phraseGroupKey] = extractQueryArgs(
            phraseKey as PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"]
          );
          const phraseGroup = getReferencedObject(
            applicationState,
            `$(text).phraseGroups.id<${phraseGroupKey}>`
          );
          const phrase = getReferencedObject(
            applicationState,
            phraseKey as PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"]
          );
          return {
            phrase,
            phraseGroup,
          };
        })
        ?.filter((pg) => !!pg?.phrase && !!pg?.phraseGroup) ?? []
    );
  }, [pinnedPhrases, applicationState]);

  const pinFilteredPhraseGroups = useMemo(() => {
    return filterPinnedPhraseGroups(
      phraseGroups ?? [],
      pinnedGroups,
      !!showOnlyPinnedGroups
    );
  }, [phraseGroups, pinnedGroups, showOnlyPinnedGroups]);

  // DO NOT PASS THIS TO PHRASE GROUPS
  const filteredPhraseGroups = useMemo(() => {
    const localeRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      selectedTopLevelLocale
    );
    if (!applicationState) {
      return [];
    }
    if (!phraseGroups) {
      return [];
    }
    return getFilteredPhrasesGroups(
      applicationState,
      pinFilteredPhraseGroups,
      localeRef,
      pinnedPhrases,
      !!showOnlyPinnedPhrases,
      filterTag,
      globalFilterRequiresUpdate,
      globalFilterUntranslated,
      searchText
    );
  }, [
    applicationState,
    pinFilteredPhraseGroups,
    selectedTopLevelLocale,
    pinnedPhrases,
    showOnlyPinnedPhrases,
    filterTag,
    globalFilterRequiresUpdate,
    globalFilterUntranslated,
    searchText,
  ]);

  const filteredPinnedPhraseGroups = useMemo(() => {
    if (!phraseGroups) {
      return [];
    }
    return filterPinnedPhraseGroups(
      phraseGroups,
      pinnedGroups,
      !!showOnlyPinnedGroups
    );
  }, [phraseGroups, pinnedGroups, showOnlyPinnedGroups]);

  useEffect(() => {
    if (selectedGroup) {
      setSelectedGroup(null);
    }
  }, [selectedGroup]);

  return (
    <ThemeProvider theme={colorTheme}>
      <ChatGPTProvider>
        <DeepLProvider>
          <TranslationMemoryProvider>
              <FocusProvider>
                <Container ref={container}>
                  <HeaderV2
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    isEditGroups={isEditGroups}
                    searchText={searchText ?? ""}
                    onSetSearchText={setSearchText}
                    selectedTopLevelLocale={selectedTopLevelLocale as string}
                    setGlobalFilterUnstranslated={setGlobalFilterUnstranslated}
                    setGlobalFilterRequiresUpdate={
                      setGlobalFilterRequiresUpdate
                    }
                    showOnlyPinnedPhrases={showOnlyPinnedPhrases ?? false}
                    setShowOnlyPinnedPhrases={setShowOnlyPinnedPhrases}
                    pinnedPhrases={pinnedPhrases}
                    setPinnedPhrases={setPinnedPhrases}
                    removePinnedPhrases={removePinnedPhrases}
                    searchTextState={searchTextState}
                    onSetSearchTextState={setSearchTextState}
                    phraseGroups={phraseGroups ?? []}
                    filteredPhraseGroups={filteredPhraseGroups ?? []}
                    onShowEditGroups={onShowEditGroups}
                    onHideEditGroups={onHideEditGroups}
                    setSelectedTopLevelLocale={onChangeTopLevelLocale}
                    onShowEditLocales={onShowLocales}
                    page={page}
                    setPage={setPage}
                    globalFilterUntranslated={globalFilterUntranslated}
                    globalFilterRequiresUpdate={globalFilterRequiresUpdate}
                    filterTag={filterTag}
                    setFilterTag={setFilterTag}
                    pinnedPhrasesWithGroups={pinnedPhrasesWithGroups}
                    selectedGroup={selectedGroup}
                    setSelectedGroup={setSelectedGroup}
                    pinnedGroups={pinnedGroups ?? []}
                    setPinnedGroups={setPinnedGroups}
                    showOnlyPinnedGroups={!!showOnlyPinnedGroups}
                    setShowOnlyPinnedGroups={setShowOnlyPinnedGroups}
                    setPhraseGroups={setPhraseGroups}
                  />
                  <Inner>
                    {container.current && (
                      <>
                        {page == "phrases" && (
                          <PhraseGroups
                            selectedTopLevelLocale={selectedTopLevelLocale}
                            globalFilterUntranslated={globalFilterUntranslated}
                            globalFilterRequiresUpdate={
                              globalFilterRequiresUpdate
                            }
                            searchText={searchText}
                            isEditingGroups={isEditGroups}
                            filterTag={filterTag}
                            showOnlyPinnedPhrases={
                              (showOnlyPinnedPhrases ?? false) &&
                              clientStorageEnabled
                            }
                            pinnedPhrases={pinnedPhrases}
                            setPinnedPhrases={setPinnedPhrases}
                            removePinnedPhrases={removePinnedPhrases}
                            scrollContainer={container.current}
                            phraseGroups={filteredPinnedPhraseGroups ?? []}
                            setPhraseGroups={setPhraseGroups}
                            savePhraseGroups={savePhraseGroups}
                            showFilters={showFilters}
                            pinnedPhrasesWithGroups={pinnedPhrasesWithGroups}
                            selectedGroup={selectedGroup}
                            pinnedGroups={pinnedGroups}
                            setPinnedGroups={setPinnedGroups}
                            showOnlyPinnedGroups={!!showOnlyPinnedGroups}
                          />
                        )}
                        {page == "locales" && <LocalesSections />}
                      </>
                    )}
                  </Inner>
                </Container>
              </FocusProvider>
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
