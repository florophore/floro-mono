import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { ThemeProvider } from "@emotion/react";
import styled from '@emotion/styled';
import { useColorTheme } from "@floro/common-web/src/hooks/color-theme";
import "./index.css";
import {
  FloroProvider,
  useClientStorageApi,
  useExtractQueryArgs,
  useFloroContext,
  useReferencedObject,
} from "./floro-schema-api";
import TextAppHeader from './header/TextAppHeader';
import LocalesSections from './locales/LocalesSections';
import PhraseGroups from './phrasegroups/PhraseGroups';
import PhraseGroup from './phrasegroups/PhraseGroup';
import { ProposedMergeRequestRepositoryUpdatesDocument } from '@floro/graphql-schemas/build/generated/main-client-graphql';
import TermGlossaryHeader from './header/TermGlossaryHeader';
import TermList from './terms/TermList';
import DeepLProvider from './deepl/DeepLContext';
import TranslationMemoryProvider from './memory/TranslationMemoryContext';


const Container = styled.div`
  width: 100%;
  padding: 24px 24px 24px 24px;
  flex: 1;
  overflow-y: scroll;
  position: relative;

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

const Layout = () => {

  const container = useRef<HTMLDivElement>(null);
  const { commandMode, apiStoreInvalidity, applicationState, clientStorage} = useFloroContext();
  const clientStorageEnabled = clientStorage != null;
  const [searchText, setSearchText] = useState<string>("");
  const [searchTermText, setSearchTermText] = useState<string>("");
  const [isEditGroups, setIsEditGroups] = useState<boolean>(false);
  const [showLocales, setShowLocales] = useState<boolean>(false);
  const [showEditTerms, setShowEditTerms] = useState<boolean>(false);

  const localeSettings = useReferencedObject("$(text).localeSettings");
  const locales = useReferencedObject("$(text).localeSettings.locales");
  const terms = useReferencedObject("$(text).terms");
  const localeCodes = useMemo(() =>  new Set(locales?.map(l => l.localeCode)),[locales]);
  const [defaultLocaleCode] = useExtractQueryArgs(localeSettings?.defaultLocaleRef);
  const [lastSelectedLocale, setLastSelectedLocale] = useClientStorageApi<string>("top-level-locale");
  const [showOnlyPinnedPhrases, setShowOnlyPinnedPhrases] = useClientStorageApi<boolean>("show-only-pinned-phrases");
  const [showOnlyPinnedTerms, setShowOnlyPinnedTerms] = useClientStorageApi<boolean>("show-only-pinned-terms");
  const [pinnedPhrases, setPinnedPhrases, removePinnedPhrases] = useClientStorageApi<Array<string>>("pinned-phrases");
  const [pinnedTerms, setPinnedTerms, removePinnedTerms] = useClientStorageApi<Array<string>>("pinned-terms");
  const [selectedTopLevelLocale, setSelectedTopLevelLocale] = useState(defaultLocaleCode);
  const [globalFilterUntranslated, setGlobalFilterUnstranslated] = useState(false);
  const [globalFilterRequiresUpdate, setGlobalFilterRequiresUpdate] = useState(false);
  const [globalFilterUntranslatedTerms, setGlobalFilterUnstranslatedTerms] = useState(false);
  const [filterTag, setFilterTag] = useState<string|null>(null);

  useEffect(() => {
    if (!!lastSelectedLocale) {
      setSelectedTopLevelLocale(lastSelectedLocale && localeCodes.has(lastSelectedLocale) ? lastSelectedLocale : defaultLocaleCode);
    }
  }, [!!lastSelectedLocale]);

  useEffect(() => {
    if (!selectedTopLevelLocale && defaultLocaleCode) {
      setSelectedTopLevelLocale(defaultLocaleCode);
    }
  }, [selectedTopLevelLocale, defaultLocaleCode])

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


  const onChangeTopLevelLocale = useCallback((locale: string) => {
    setLastSelectedLocale(locale);
    setSelectedTopLevelLocale(locale);
  }, [setSelectedTopLevelLocale, setLastSelectedLocale, applicationState])

  return (
    <DeepLProvider>
      <TranslationMemoryProvider>
        <Container ref={container}>
          {showLocales && <LocalesSections />}
          <TextAppHeader
            isEditGroups={isEditGroups}
            isEditLocales={showLocales}
            onShowEditGroups={onShowEditGroups}
            onHideEditGroups={onHideEditGroups}
            onShowEditLocales={onShowLocales}
            onHideEditLocales={onHideLocales}
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
          />
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
          />
          {((terms?.length ?? 0) > 0 || commandMode == "edit") && (
            <TermGlossaryHeader
              onSetSearchTermText={setSearchTermText}
              searchTermText={searchTermText}
              isEditTerms={showEditTerms}
              onShowEditTerms={onShowEditTerms}
              onHideEditTerms={onHideEditTerms}
              globalFilterUntranslatedTerms={globalFilterUntranslatedTerms}
              setGlobalFilterUnstranslatedTerms={setGlobalFilterUnstranslatedTerms}
              showOnlyPinnedTerms={showOnlyPinnedTerms ?? false}
              setShowOnlyPinnedTerms={setShowOnlyPinnedTerms}
              pinnedTerms={pinnedTerms}
              setPinnedTerms={setPinnedPhrases}
              removePinnedTerms={removePinnedTerms}
              selectedTopLevelLocale={selectedTopLevelLocale}
            />
          )}
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
        </Container>
      </TranslationMemoryProvider>
    </DeepLProvider>
  );
};

function App() {
  const colorTheme = useColorTheme();

  return (
    <FloroProvider>
      <ThemeProvider theme={colorTheme}>
        <Layout />
      </ThemeProvider>
    </FloroProvider>
  );
}

export default App;
