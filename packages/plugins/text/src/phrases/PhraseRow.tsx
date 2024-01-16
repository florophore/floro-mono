import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  PointerTypes,
  SchemaTypes,
  containsDiffable,
  makeQueryRef,
  useCopyApi,
  useFloroContext,
  useFloroState,
  useHasIndication,
  useReferencedObject,
} from "../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import ReactDOM from "react-dom";

import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import PhraseTranslation from "./phrasetranslation/PhraseTranslation";
import ColorPalette from "@floro/styles/ColorPalette";

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";

import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";

import CopyLight from "@floro/common-assets/assets/images/icons/copy.lighter.svg";
import CopyDark from "@floro/common-assets/assets/images/icons/copy.dark.svg";

import FocusLight from "@floro/common-assets/assets/images/icons/focus.light.lighter.svg";
import FocusDark from "@floro/common-assets/assets/images/icons/focus.dark.svg";

import CrossLight from "@floro/common-assets/assets/images/icons/cross.light.svg";
import CrossDark from "@floro/common-assets/assets/images/icons/cross.dark.svg";

import ChevronLight from "@floro/common-assets/assets/images/icons/chevron.light.svg";
import ChevronDark from "@floro/common-assets/assets/images/icons/chevron.dark.svg";

import ScrollToTopLight from "@floro/common-assets/assets/images/icons/scroll.to.top.light.svg";
import ScrollToTopDark from "@floro/common-assets/assets/images/icons/scroll.to.top.dark.svg";

import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import DescriptionContainer from "./DescriptionContainer";
import UpdatePhraseModal from "./UpdatePhraseModal";
import TagList from "./tags/TagList";
import DuplicatePhraseModal from "./DuplicatePhraseModal";
import { useDiffColor } from "../diff";
import throttle from "lodash/throttle";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import {
  getPhraseIsUntranslated,
  getPhraseMatchesSearch,
  getPhraseTranslationRequiresUpdate,
  getTranslateFromLocale,
} from "../phrasegroups/filterhooks";
import Button from "@floro/storybook/stories/design-system/Button";
import { useFocusContext } from "../focusview/FocusContext";

const Container = styled.div`
  padding: 0;
  margin-bottom: 8px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  background: ${(props) => props.theme.background};
  padding: 0px 16px 18px 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 24px;
`;

const Sticky = styled.div`
  position: sticky;
  top: -82px;
  z-index: 1;
  margin-bottom: 24px;
  background: ${props => props.theme.background};
  padding-top: 24px;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const MissingTranslationsPill = styled.div`
  height: 24px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${(props) => props.theme.colors.warningTextColor};
  padding-left: 12px;
  padding-right: 12px;
  margin-left: 12px;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const MissingTranslationsTitle = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1rem;
  color: ${ColorPalette.white};
`;

const DragIcon = styled.img`
  height: 24px;
  width: 24px;
  pointer-events: none;
  user-select: none;
`;

const DeleteVarContainer = styled.div`
  cursor: pointer;
  margin-left: 16px;
  padding-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DeleteVar = styled.img`
  height: 32px;
  width: 32px;
`;

const PinPhrase = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const NoResultsContainer = styled.div`
  margin-top: 24px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px solid ${(props) => props.theme.colors.inputBorderColor};
  background: ${(props) =>
    props.theme.name == "light"
      ? ColorPalette.extraLightGray
      : ColorPalette.darkerGray};
`;

const AllContentFiltered = styled.p`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

const ClearLocalSearch = styled.p`
  margin-top: 8px;
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.linkColor};
  text-decoration: underline;
  cursor: pointer;
`;

const CrossIcon = styled.img`
  height: 40px;
  width: 40px;
  cursor: pointer;
`;

const ChevronWrapper = styled.div`
  height: 32px;
  width: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 4px;
  cursor: pointer;
`;

const ChevronIcon = styled.img`
  height: 16px;
  width: 16px;
  transition: transform 150ms;
  user-select: none;
`;

const ScrollTopIcon = styled.img`
  height: 28px;
  width: 28px;
  cursor: pointer;
`;

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseGroup: SchemaTypes["$(text).phraseGroups.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  selectedPhraseRef:
    | PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"]
    | null;
  index: number;
  selectedTopLevelLocale: string;
  pinnedPhrases: Array<string> | null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  onRemove: (
    phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"]
  ) => void;
  scrollContainer?: HTMLDivElement;
  searchText: string;
  showOnlyPinnedPhrases: boolean;
  isFocusingPhraseSelector: boolean;
  isGroupVisible: boolean;
  globalFilterUntranslated: boolean;
  globalFilterRequiresUpdate: boolean;
  onSetDismissedUnTranslated: (phraseId: string) => void;
  onSetDismissedRequiredUpdated: (phraseId: string) => void;
  onScrollToPhrase: (phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"]) => void;
}

const PhraseRow = (props: Props) => {
  const container = useRef<HTMLDivElement>(null);
  const subContainer = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded])
  const [manualSearchText, setManualSearchText] = useState<string>(
    props.searchText ?? ""
  );

  const [realManualSearchText, setRealManualSearchText] = useState(
    props.searchText ?? ""
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setManualSearchText(realManualSearchText ?? "");
    }, 300);
    return () => {
      clearTimeout(timeout);
    };
  }, [realManualSearchText, props.selectedTopLevelLocale]);

  const isSearching = useMemo(
    () => manualSearchText.trim() != "",
    [manualSearchText]
  );

  useEffect(() => {
    if (!props?.scrollContainer) {
      return;
    }
    if (props.selectedPhraseRef == props.phraseRef) {
      if (container.current) {
        if (container.current) {
          const scrollY =
            container.current.offsetTop - props?.scrollContainer.offsetTop;
          props?.scrollContainer.scroll(0, scrollY - 24);
        }
      }
    }
  }, [
    props?.scrollContainer,
    props.selectedPhraseRef,
    props.phraseRef,
    isVisible,
  ]);

  useEffect(() => {
    if (props.showOnlyPinnedPhrases) {
      return;
    }
    setRealManualSearchText(props.searchText ?? "");
  }, [
    props.searchText,
    props.showOnlyPinnedPhrases,
    props.selectedTopLevelLocale,
  ]);

  const onClearSearch = useCallback(() => {
    setRealManualSearchText("");
    setManualSearchText("");
  }, []);

  useEffect(() => {
    if (!props?.scrollContainer) {
      return;
    }
    const onScroll = () => {
      if (!props?.scrollContainer) {
        return;
      }
      if (!container.current) {
        return;
      }
      const rect = container.current.getBoundingClientRect();
      const scrollRect = props.scrollContainer.getBoundingClientRect();
      const windowHeight = scrollRect.height - 72;
      let isVisible = false;
      if (rect.top > 0) {
        isVisible = rect.top <= windowHeight * 2;
      } else {
        if (rect.top + rect.height >= 0) {
          isVisible = true;
        } else {
          isVisible = Math.abs(rect.top + rect.height) < windowHeight * 2;
        }
      }
      setIsVisible(isVisible);
    };
    const onScrollThrottle = throttle(onScroll, 30, {
      trailing: true,
      leading: true,
    });
    props.scrollContainer.addEventListener("scroll", onScrollThrottle);
    props.scrollContainer.addEventListener("keydown", onScroll);
    props.scrollContainer.addEventListener("click", onScroll);
    props.scrollContainer.addEventListener("resize", onScroll);
    onScroll();
    const interval = setInterval(onScroll, 100);
    return () => {
      if (!props?.scrollContainer) {
        return;
      }
      props.scrollContainer.removeEventListener("scroll", onScrollThrottle);
      props.scrollContainer.removeEventListener("keydown", onScroll);
      props.scrollContainer.removeEventListener("click", onScroll);
      props.scrollContainer.removeEventListener("resize", onScroll);
      clearInterval(interval);
    };
  }, [props?.scrollContainer]);
  const theme = useTheme();
  const locales = useReferencedObject("$(text).localeSettings.locales");
  const searchRef = useRef<HTMLInputElement>(null);
  const onFocusSearch = useCallback(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);
  const {
    applicationState,
    commandMode,
    clientStorage,
    isCopyMode,
    conflictSet,
    changeset,
  } = useFloroContext();
  const clientStorageIsEnabled = clientStorage != null;
  const [selectedLocaleCode, setSelectedLocaleCode] = useState(
    props.selectedTopLevelLocale
  );
  const localeSettings = useReferencedObject("$(text).localeSettings");
  const [phrase, setPhrase] = useFloroState(props.phraseRef);

  const [showEnabledFeatures, setShowEnabledFeatures] = useState(false);
  const [descriptionValue, setDescriptionValue, saveDescription] =
    useFloroState(`${props.phraseRef}.description`);
  const selectedLocale = useMemo(
    () =>
      localeSettings.locales.find((l) => l.localeCode == selectedLocaleCode),
    [localeSettings.locales, selectedLocaleCode]
  );
  const externalDiffColor = useDiffColor(props.phraseRef, false, "darker");
  const diffColor = useDiffColor(props.phraseRef, true, "darker");

  const { isCopied, toggleCopy } = useCopyApi(props.phraseRef);

  const hasIndications = useHasIndication(props.phraseRef, true);
  const indicatedLocales = useMemo(() => {
    if (!hasIndications) {
      return [];
    }
    const changesetDiffables = Array.from(changeset).filter((ref) => {
      return ref.startsWith(props.phraseRef);
    });
    const conflictSetDiffables = Array.from(conflictSet).filter((ref) => {
      return ref.startsWith(props.phraseRef);
    });
    return locales.filter((locale) => {
      const localeRef = makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        locale?.localeCode
      );
      for (let change of changesetDiffables) {
        if (change.indexOf(localeRef) != -1) {
          return true;
        }
      }
      for (let conflict of conflictSetDiffables) {
        if (conflict.indexOf(localeRef) != -1) {
          return true;
        }
      }
      return false;
    });
  }, [
    hasIndications,
    commandMode,
    conflictSet,
    changeset,
    props.phraseRef,
    locales,
  ]);

  const hasConflict = useMemo(() => {
    return containsDiffable(conflictSet, props.phraseRef, true);
  }, [conflictSet, props.phraseRef, locales]);

  const indicatedLocaleCodes = useMemo(() => {
    return indicatedLocales?.map((l) => l.localeCode).join(", ");
  }, [indicatedLocales]);

  const systemSourceLocale = useMemo(() => {
    if (selectedLocale?.defaultTranslateFromLocaleRef) {
      return (
        localeSettings.locales.find(
          (l) =>
            makeQueryRef(
              "$(text).localeSettings.locales.localeCode<?>",
              l.localeCode
            ) == selectedLocale.defaultTranslateFromLocaleRef
        ) ?? null
      );
    }
    if (
      localeSettings.defaultLocaleRef ==
      makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        selectedLocale?.localeCode as string
      )
    ) {
      return null;
    }
    return (
      localeSettings.locales.find(
        (l) =>
          makeQueryRef(
            "$(text).localeSettings.locales.localeCode<?>",
            l.localeCode
          ) == localeSettings.defaultLocaleRef
      ) ?? null
    );
  }, [localeSettings.locales, localeSettings.defaultLocaleRef, selectedLocale]);

  const globalFallbackLocale = useMemo(() => {
    return (
      localeSettings.locales.find(
        (l) =>
          makeQueryRef(
            "$(text).localeSettings.locales.localeCode<?>",
            l.localeCode
          ) == localeSettings.defaultLocaleRef
      ) ?? null
    );
  }, [localeSettings.locales, localeSettings.defaultLocaleRef, selectedLocale]);

  const fallbackLocale = useMemo(() => {
    if (selectedLocale?.defaultFallbackLocaleRef) {
      return (
        localeSettings.locales.find(
          (l) =>
            makeQueryRef(
              "$(text).localeSettings.locales.localeCode<?>",
              l.localeCode
            ) == selectedLocale.defaultFallbackLocaleRef
        ) ?? null
      );
    }
    if (
      localeSettings.defaultLocaleRef ==
      makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        selectedLocale?.localeCode as string
      )
    ) {
      return null;
    }
    return globalFallbackLocale;
  }, [
    localeSettings.locales,
    localeSettings.defaultLocaleRef,
    selectedLocale,
    globalFallbackLocale,
  ]);

  useEffect(() => {
    setSelectedLocaleCode(props.selectedTopLevelLocale);
  }, [props.selectedTopLevelLocale]);

  const localeOptions = useMemo(() => {
    return [
      ...(locales?.map((locale) => {
        return {
          label: `${locale.localeCode}`,
          value: locale.localeCode.toUpperCase(),
        };
      }) ?? []),
    ];
  }, [locales]);

  const onUpdateDescription = useCallback(
    (value: string) => {
      if (!descriptionValue) {
        return;
      }
      setDescriptionValue(
        {
          ...descriptionValue,
          value,
        },
        false
      );
    },
    [descriptionValue, setDescriptionValue]
  );

  useEffect(() => {
    if (commandMode == "edit") {
      const timeout = setTimeout(() => {
        saveDescription();
      }, 500);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [descriptionValue?.value, commandMode]);

  const hasUnTranslatedParts = useMemo(() => {
    if (commandMode != "edit") {
      return false;
    }
    if (!phrase || !applicationState) {
      return false;
    }
    const localeRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      selectedLocale?.localeCode ?? (props.selectedTopLevelLocale as string)
    );

    const translateFromDisplayValue = getTranslateFromLocale(
      applicationState,
      localeRef
    );
    const translateFromRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      translateFromDisplayValue?.localeCode as string
    );
    return getPhraseIsUntranslated(props.phrase, localeRef, translateFromRef);
  }, [applicationState, phrase, selectedLocale?.localeCode, selectedLocale]);

  const showAllTranslated = useMemo(() => {
    if (commandMode != "edit") {
      return false;
    }
    if (!props.globalFilterUntranslated) {
      return false;
    }
    if (!phrase || !applicationState) {
      return false;
    }
    const localeRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      selectedLocale?.localeCode ?? (props.selectedTopLevelLocale as string)
    );

    const translateFromDisplayValue = getTranslateFromLocale(
      applicationState,
      localeRef
    );
    const translateFromRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      translateFromDisplayValue?.localeCode as string
    );
    return !getPhraseIsUntranslated(phrase, localeRef, translateFromRef);
  }, [
    hasUnTranslatedParts,
    props.globalFilterUntranslated,
    commandMode,
    phrase,
    selectedLocale?.localeCode ?? props.selectedTopLevelLocale,
  ]);

  const showUpToDate = useMemo(() => {
    if (commandMode != "edit") {
      return false;
    }
    if (!props.globalFilterRequiresUpdate) {
      return false;
    }
    if (!phrase || !applicationState) {
      return false;
    }
    const localeRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      selectedLocale?.localeCode ?? (props.selectedTopLevelLocale as string)
    );

    const translateFromDisplayValue = getTranslateFromLocale(
      applicationState,
      localeRef
    );
    const translateFromRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      translateFromDisplayValue?.localeCode as string
    );
    return !getPhraseTranslationRequiresUpdate(
      props.phrase,
      localeRef,
      translateFromRef
    );
  }, [
    applicationState,
    hasUnTranslatedParts,
    props.globalFilterRequiresUpdate,
    commandMode,
    props.phrase,
    selectedLocale?.localeCode ?? props.selectedTopLevelLocale,
  ]);

  const trashIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);

  const editIcon = useMemo(() => {
    if (theme.name == "light") {
      return EditLight;
    }
    return EditDark;
  }, [theme.name]);

  const copyIcon = useMemo(() => {
    if (theme.name == "light") {
      return CopyLight;
    }
    return CopyDark;
  }, [theme.name]);

  const focusIcon = useMemo(() => {
    if (theme.name == "light") {
      return FocusLight;
    }
    return FocusDark;
  }, [theme.name]);

  const crossIcon = useMemo(() => {
    if (theme.name == "light") {
      return CrossLight;
    }
    return CrossDark;
  }, [theme.name]);

  const chevronIcon = useMemo(() => {
    if (theme.name == "light") {
      return ChevronLight;
    }
    return ChevronDark;
  }, [theme.name]);

  const scrollToTopIcon = useMemo(() => {
    if (theme.name == "light") {
      return ScrollToTopLight;
    }
    return ScrollToTopDark;
  }, [theme.name]);

  const isPinned = useMemo(() => {
    return props.pinnedPhrases?.includes(props.phraseRef) ?? false;
  }, [props.pinnedPhrases, props.phraseRef, clientStorage]);

  const onTogglePin = useCallback(() => {
    if (props.pinnedPhrases?.includes(props.phraseRef)) {
      props.setPinnedPhrases(
        props.pinnedPhrases.filter((p) => p != props.phraseRef)
      );
    } else {
      props.setPinnedPhrases([...(props.pinnedPhrases ?? []), props.phraseRef]);
    }
  }, [isPinned, props.setPinnedPhrases, props.pinnedPhrases, props.phraseRef]);

  const onRemove = useCallback(() => {
    props?.onRemove(props.phrase);
  }, [props.onRemove, props.phrase]);

  const [showUpdate, setShowUpdate] = useState(false);

  const onShowUpdate = useCallback(() => {
    setShowUpdate(true);
  }, []);

  const onHideUpdate = useCallback(() => {
    setShowUpdate(false);
  }, []);

  const [showDuplicate, setShowDuplicate] = useState(false);

  const onShowDuplicate = useCallback(() => {
    setShowDuplicate(true);
  }, []);

  const onHideDuplicate = useCallback(() => {
    setShowDuplicate(false);
  }, []);

  const searchBorderColor = useMemo(() => {
    if (theme.name == "light") {
      return ColorPalette.gray;
    }
    return ColorPalette.gray;
  }, [theme.name]);

  const {
    showFocus,
    focusPortal,
    focusScroll,
    focusPhraseRef,
    setShowFocus,
    setFocusPhraseRef,
    onCloseFocus,
  } = useFocusContext();

  const memoizedTranslation = useMemo(() => {
    if (!selectedLocale) {
      return null;
    }

    const isFocused =
      showFocus &&
      focusPortal?.current &&
      props.phraseRef &&
      focusPhraseRef == props.phraseRef;
    if (!isFocused && !isExpanded) {
      return null;
    }

    if (!props.isGroupVisible && !isFocused) {
      return null;
    }

    if (
      !isVisible &&
      !props.isFocusingPhraseSelector &&
      commandMode != "compare" &&
      !isFocused
    ) {
      return null;
    }
    return (
      <PhraseTranslation
        phraseRef={props.phraseRef}
        selectedLocale={selectedLocale}
        systemSourceLocale={systemSourceLocale}
        fallbackLocale={fallbackLocale}
        globalFallbackLocale={globalFallbackLocale}
        pinnedPhrases={props.pinnedPhrases}
        setPinnedPhrases={props.setPinnedPhrases}
        globalFilterUntranslated={props.globalFilterUntranslated}
        isPinned={isPinned}
        showEnabledFeatures={showEnabledFeatures}
        setShowEnabledFeatures={setShowEnabledFeatures}
        isVisible={isVisible}
        ref={subContainer}
        isSearching={isSearching}
        searchText={manualSearchText}
        onFocusSearch={onFocusSearch}
        scrollContainer={isFocused ? (focusScroll?.current ?? props?.scrollContainer) : props?.scrollContainer}
        isFocusingPhraseSelector={props.isFocusingPhraseSelector}
        isFocused={!!isFocused}
      />
    );
  }, [
    isExpanded,
    props.isFocusingPhraseSelector,
    props.selectedPhraseRef,
    isSearching,
    props.searchText,
    manualSearchText,
    applicationState,
    props.isGroupVisible,
    isVisible,
    selectedLocale,
    props.phrase,
    props.phraseRef,
    systemSourceLocale,
    fallbackLocale,
    globalFallbackLocale,
    props.pinnedPhrases,
    props.setPinnedPhrases,
    props.globalFilterUntranslated,
    isPinned,
    showEnabledFeatures,
    setShowEnabledFeatures,
    onFocusSearch,
    commandMode,
    focusScroll
  ]);

  const showNoResults = useMemo(() => {
    if (!isSearching) {
      return false;
    }
    const localeRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      selectedLocale?.localeCode as string
    );
    if (!phrase) {
      return true;
    }
    const hasMatch = getPhraseMatchesSearch(
      phrase,
      localeRef,
      manualSearchText,
      {
        skipDescription: true,
        skipPhraseKey: true,
        skipTitles: true,
        skipVars: true,
      }
    );
    return !hasMatch;
  }, [manualSearchText, selectedLocale?.localeCode, isSearching]);

  const onShowFocus = useCallback(() => {
    setShowFocus(true);
    setFocusPhraseRef(props.phraseRef);
  }, [props.phraseRef]);

  const isFocused =
    showFocus &&
    focusPortal?.current &&
    props.phraseRef &&
    focusPhraseRef == props.phraseRef;
  useEffect(() => {
    if (isFocused) {
      return () => {
        onCloseFocus();
      };
    }
  }, [isFocused]);

  const compareModeMissing =
    commandMode == "compare" && !hasIndications ? (
      <div style={{ padding: `24px 24px 0px 24px` }}>
        <TitleRow>
          <RowTitle
            style={{
              fontWeight: 600,
              marginTop: 0,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span style={{ color: theme.colors.contrastText }}>
              {"Phrase Key: "}
            </span>
            <span style={{ color: theme.colors.titleText, marginLeft: 8 }}>
              {props.phrase.phraseKey}
            </span>
            <span>
              <MissingTranslationsPill>
                <MissingTranslationsTitle>{`nothing to show in diff`}</MissingTranslationsTitle>
              </MissingTranslationsPill>
            </span>
          </RowTitle>
        </TitleRow>
      </div>
    ) : null;

  const inner =
    commandMode == "compare" && !hasIndications ? (
      compareModeMissing
    ) : (
      <>
        <UpdatePhraseModal
          show={showUpdate}
          onDismiss={onHideUpdate}
          phraseGroup={props.phraseGroup}
          phrase={props.phrase}
        />
        <DuplicatePhraseModal
          show={showDuplicate}
          onDismiss={onHideDuplicate}
          phraseGroup={props.phraseGroup}
          phrase={props.phrase}
        />
        <Sticky style={{
          borderBottom: isExpanded || isFocused ? `1px solid ${ColorPalette.gray}` : 0
        }}>
          <TitleRow>
            <RowTitle
              style={{
                fontWeight: 600,
                marginTop: 0,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <span style={{ color: theme.colors.contrastText }}>
                {"Phrase Key: "}
              </span>
              <span onClick={toggleExpanded} style={{ color: theme.colors.titleText, marginLeft: 8 }}>
                {props.phrase.phraseKey}
              </span>
              {!isFocused && (
                <ChevronWrapper onClick={toggleExpanded}>
                  <ChevronIcon
                    src={chevronIcon}
                    style={{
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  />
                </ChevronWrapper>
              )}
              <span>
                {hasUnTranslatedParts && (
                  <MissingTranslationsPill>
                    <MissingTranslationsTitle>{`missing ${
                      selectedLocale?.localeCode ?? props.selectedTopLevelLocale
                    } values`}</MissingTranslationsTitle>
                  </MissingTranslationsPill>
                )}
              </span>
            </RowTitle>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: -16,
                  marginLeft: 24,
                }}
              >
                {commandMode != "edit" && !showFocus && isExpanded && (
                  <>
                    <DeleteVarContainer
                      onClick={onShowFocus}
                      style={{ marginRight: 24 }}
                    >
                      <DeleteVar src={focusIcon} />
                    </DeleteVarContainer>
                  </>
                )}
                {commandMode == "edit" && !showFocus && isExpanded && (
                  <>
                    <DeleteVarContainer
                      onClick={onShowFocus}
                      style={{ marginRight: 12 }}
                    >
                      <DeleteVar src={focusIcon} />
                    </DeleteVarContainer>
                    <DeleteVarContainer>
                      <DeleteVar onClick={onShowDuplicate} src={copyIcon} />
                    </DeleteVarContainer>
                    <DeleteVarContainer>
                      <DeleteVar onClick={onShowUpdate} src={editIcon} />
                    </DeleteVarContainer>
                    <DeleteVarContainer style={{ marginRight: 24 }}>
                      <DeleteVar src={trashIcon} onClick={onRemove} />
                    </DeleteVarContainer>
                  </>
                )}
                {(isExpanded || isFocused) && (
                  <InputSelector
                    hideLabel
                    options={localeOptions}
                    value={selectedLocaleCode ?? null}
                    label={"locale"}
                    placeholder={"locale"}
                    size="shortest"
                    onChange={(option) => {
                      setSelectedLocaleCode(option?.value as string);
                    }}
                    maxHeight={800}
                  />
                )}
              </div>
            </div>
          </TitleRow>
          {hasIndications && (
            <div
              style={{
                height: 56,
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <span style={{ marginLeft: 0 }}>
                <PinPhrase
                  style={{
                    fontWeight: 700,
                    fontSize: "1.4rem",
                    color: diffColor,
                  }}
                >
                  {(hasConflict
                    ? "Conflicted Locales: "
                    : "Changed Locales: ") + indicatedLocaleCodes}
                </PinPhrase>
              </span>
            </div>
          )}
          <div
            style={{
              marginTop: 12,
              marginBottom: 12,
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  height: 56,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
                >
                {clientStorageIsEnabled && (

                  <div
                    style={{
                      height: 56,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Checkbox isChecked={isPinned} onChange={onTogglePin} />
                    <span style={{ marginLeft: 12 }}>
                      <PinPhrase>{"Keep Phrase Pinned"}</PinPhrase>
                    </span>
                  </div>
                )}
                {(isFocused || isExpanded) && (
                  <span
                    onClick={() => {
                      if (isFocused) {
                        focusScroll?.current?.scroll?.({top: 0, left: 0, behavior: "smooth"})
                      } else {
                        props.onScrollToPhrase(props.phraseRef);
                      }
                    }}
                    style={{ marginLeft: 24, marginTop: 8 }}
                  >
                    <ScrollTopIcon
                      src={scrollToTopIcon}
                    />
                  </span>
                )}
              </div>
            </div>
            {(isExpanded || isFocused) && (
              <div
                style={{
                  height: 56,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <SearchInput
                  ref={searchRef}
                  borderColor={searchBorderColor}
                  value={realManualSearchText}
                  placeholder={`search ${phrase?.phraseKey}`}
                  onTextChanged={setRealManualSearchText}
                  showClear
                />
                {showFocus && (
                  <CrossIcon
                    onClick={onCloseFocus}
                    style={{ marginLeft: 24 }}
                    src={crossIcon}
                  />
                )}
              </div>
            )}
          </div>
        </Sticky>
        {(isFocused || isExpanded) && (
          <>
            {isCopyMode && (
              <div
                style={{
                  height: 56,
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Checkbox isChecked={isCopied} onChange={toggleCopy} />
                <span style={{ marginLeft: 12 }}>
                  <PinPhrase>{"Copy Phrase"}</PinPhrase>
                </span>
              </div>
            )}
            {commandMode == "edit" && showAllTranslated && (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {clientStorageIsEnabled && (
                    <div
                      style={{
                        height: 56,
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: 250,
                      }}
                    >
                      <PinPhrase
                        style={{ color: theme.colors.warningTextColor }}
                      >
                        {"All translated "}
                      </PinPhrase>
                      <div style={{ marginLeft: 12, width: 80 }}>
                        <Button
                          onClick={() => {
                            if (!props?.phrase.id) {
                              return;
                            }
                            props.onSetDismissedUnTranslated(props?.phrase.id);
                          }}
                          label={"dismiss"}
                          bg={"orange"}
                          size={"extra-small"}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {commandMode == "edit" && showUpToDate && (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {clientStorageIsEnabled && (
                    <div
                      style={{
                        height: 56,
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: 250,
                      }}
                    >
                      <PinPhrase
                        style={{ color: theme.colors.warningTextColor }}
                      >
                        {"Up to date "}
                      </PinPhrase>
                      <div style={{ marginLeft: 12, width: 80 }}>
                        <Button
                          onClick={() => {
                            if (!props?.phrase.id) {
                              return;
                            }
                            props?.onSetDismissedRequiredUpdated(
                              props?.phrase?.id
                            );
                          }}
                          label={"dismiss"}
                          bg={"orange"}
                          size={"extra-small"}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div
              style={{
                marginTop: 24,
              }}
            >
              <DescriptionContainer
                description={descriptionValue?.value ?? ""}
                onUpdateDescription={onUpdateDescription}
                isReadOnly={commandMode != "edit"}
                phraseRef={props.phraseRef}
              />
            </div>
            <div
              style={{
                marginBottom: commandMode != "edit" ? 24 : 48,
              }}
            >
              {(phrase?.tagsEnabled || (phrase?.tags?.length ?? 0) > 0) && (
                <TagList phraseRef={props.phraseRef} />
              )}
            </div>
            {!showNoResults && (
              <div
                style={{
                  borderTop: `1px solid ${theme.colors.contrastTextLight}`,
                  paddingTop: 24,
                  visibility: isVisible || isFocused ? "visible" : "hidden",
                }}
              >
                {memoizedTranslation}
              </div>
            )}
            {showNoResults && (
              <div
                style={{
                  borderTop: `1px solid ${theme.colors.contrastTextLight}`,
                  paddingTop: 24,
                  visibility: isVisible || isFocused ? "visible" : "hidden",
                }}
              >
                <NoResultsContainer>
                  <AllContentFiltered>
                    {"all content has been filtered by local search"}
                  </AllContentFiltered>
                  <ClearLocalSearch onClick={onClearSearch}>
                    {"clear local search & show content"}
                  </ClearLocalSearch>
                </NoResultsContainer>
              </div>
            )}
          </>
        )}
      </>
    );

  const innerWithPortal =
    showFocus &&
    focusPortal?.current &&
    props.phraseRef &&
    focusPhraseRef == props.phraseRef ? (
      <>
        {ReactDOM.createPortal(inner, focusPortal.current)}
        {inner}
      </>
    ) : (
      inner
    );

  return (
    <Container style={{ borderColor: externalDiffColor }} ref={container}>
      {innerWithPortal}
    </Container>
  );
};

export default PhraseRow;
