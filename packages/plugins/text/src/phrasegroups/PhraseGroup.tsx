import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import {
  PointerTypes,
  SchemaTypes,
  containsDiffable,
  getReferencedObject,
  makeQueryRef,
  useClientStorageApi,
  useFloroContext,
  useFloroState,
  useHasConflict,
  useIsFloroInvalid,
  useQueryRef,
  useWasAdded,
  useWasRemoved,
} from "../floro-schema-api";
import throttle from "lodash/throttle";
import FolderLight from "@floro/common-assets/assets/images/icons/folder.light.svg";
import FolderDark from "@floro/common-assets/assets/images/icons/folder.dark.svg";

import FolderAddedLight from "@floro/common-assets/assets/images/icons/folder.added.light.svg";
import FolderAddedDark from "@floro/common-assets/assets/images/icons/folder.added.dark.svg";

import FolderRemovedLight from "@floro/common-assets/assets/images/icons/folder.removed.light.svg";
import FolderRemovedDark from "@floro/common-assets/assets/images/icons/folder.removed.dark.svg";

import FolderConflictLight from "@floro/common-assets/assets/images/icons/folder.conflict.light.svg";
import FolderConflictDark from "@floro/common-assets/assets/images/icons/folder.conflict.dark.svg";

import ChevronLight from "@floro/common-assets/assets/images/icons/chevron.light.svg";
import ChevronDark from "@floro/common-assets/assets/images/icons/chevron.dark.svg";

import DraggerLight from "@floro/common-assets/assets/images/icons/dragger.light.svg";
import DraggerDark from "@floro/common-assets/assets/images/icons/dragger.dark.svg";

import TrashLight from "@floro/common-assets/assets/images/icons/discard.light.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/discard.dark.svg";

import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";

import FocusLight from "@floro/common-assets/assets/images/icons/focus.light.svg";
import FocusDark from "@floro/common-assets/assets/images/icons/focus.dark.svg";

import PlusLight from "@floro/common-assets/assets/images/icons/plus.light.svg";
import PlusDark from "@floro/common-assets/assets/images/icons/plus.dark.svg";

import SearchLight from "@floro/common-assets/assets/images/icons/search_glass_active.light.svg";
import SearchDark from "@floro/common-assets/assets/images/icons/search_glass_active.dark.svg";

import MinusLight from "@floro/common-assets/assets/images/icons/minus.light.svg";
import MinusDark from "@floro/common-assets/assets/images/icons/minus.dark.svg";

import ScrollToTopLight from "@floro/common-assets/assets/images/icons/scroll.to.top.light.svg";
import ScrollToTopDark from "@floro/common-assets/assets/images/icons/scroll.to.top.dark.svg";

import ColorPalette from "@floro/styles/ColorPalette";
import { AnimatePresence, Reorder, useDragControls } from "framer-motion";
import Button from "@floro/storybook/stories/design-system/Button";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import AddPhraseModal from "../phrases/AddPhraseModal";
import PhraseReOrderRow from "../phrases/PhraseReOrderRow";
import PhraseRow from "../phrases/PhraseRow";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import { filterPhrasesOnSearch, filterPinnedPhrasesFromPhraseGroup, getPhrasesFilteredForPhraseGroup, getPhrasesGroupHasMatches } from "./filterhooks";

const Container = styled.div`
  border-top: 1px solid ${ColorPalette.gray};
  min-width: 1020px;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 32px 48px 8px 24px;
  height: 96px;
`;

const StickRow = styled.div`
  position: sticky;
  z-index: 1;
  transition: box-shadow 100ms top 100ms;
`;

const PinPhrase = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const FolderRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 48px;
`;

const AddRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-end;
`;

const FolderIcon = styled.img`
  height: 32px;
  margin-right: 8px;
  user-select: none;
  cursor: pointer;
`;

const Title = styled.h4`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.contrastText};
  user-select: none;
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

const SubTitleRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const SubTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${ColorPalette.linkBlue};
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
`;

const DragShadeContainer = styled.div`
  height: 50px;
  cursor: grab;
  margin-right: 24px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const DragIcon = styled.img`
  height: 24px;
  width: 24px;
  pointer-events: none;
  user-select: none;
`;
const DeleteShadeContainer = styled.div`
  cursor: pointer;
  margin-left: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EditContainer = styled.div`
  cursor: pointer;
  margin-left: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DeleteShade = styled.img`
  height: 24px;
  width: 24px;
  pointer-events: none;
  user-select: none;
`;

const EditIcon = styled.img`
  height: 24px;
  width: 24px;
  pointer-events: none;
  user-select: none;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const FilterUntranslated = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastTextLight};
  font-weight: 500;
  font-size: 1.4rem;
  padding: 0;
  margin-right: 12px;
  margin-left: 12px;
`;

const FocusIcon = styled.img`
  height: 24px;
  width: 24px;
  cursor: pointer;
`;

const ScrollTopIcon = styled.img`
  height: 28px;
  width: 28px;
  cursor: pointer;
`;

const PlusIcon = styled.img`
  height: 28px;
  width: 28px;
  cursor: pointer;
`;

const colorPaletteItemVariants = {
  hidden: { opacity: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    transition: {
      delay: custom,
    },
  }),
};

const RENDER_CONSTANT = 3;

interface Props {
  phraseGroup: SchemaTypes["$(text).phraseGroups.id<?>"];
  searchText: string;
  onRemoveGroup: (iconGroup: SchemaTypes["$(text).phraseGroups.id<?>"]) => void;
  isEditingGroups: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  index: number;
  selectedTopLevelLocale: string;
  globalFilterUntranslated: boolean;
  globalFilterRequiresUpdate: boolean;
  filterTag: string | null;

  pinnedPhrases: Array<string> | null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  removePinnedPhrases: () => void;
  scrollContainer: HTMLDivElement;
  showFilters?: boolean;
  showOnlyPinnedPhrases: boolean;
  showOnlyPinnedGroups: boolean;
  pinnedPhrasesWithGroups: {
    phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
    phraseGroup: SchemaTypes["$(text).phraseGroups.id<?>"];
  }[];
  selectedGroup: string | null;
  pinnedGroups: Array<string>|null;
  setPinnedGroups: (groupRefs: Array<string>) => void;
}

const PhraseGroup = (props: Props) => {
  const theme = useTheme();
  const controls = useDragControls();
  const sticky = useRef<HTMLDivElement>(null);
  const phraseGroupContainer = useRef<HTMLDivElement>(null);
  const scrollContainer = useRef<HTMLDivElement>(null);

  const [showGroupSearch, setShowGroupSearch] = useState(false);
  const [isFocusingSearch, setIsFocusingSearch] = useState(false);
  const [manualSearchText, setManualSearchText] = useState("");
  const [realManualSearchText, setRealManualSearchText] = useState("");


  const hasPinnedPhrases = useMemo(() => {
    return props.pinnedPhrasesWithGroups.filter(pinnedPhraseWithGroup => {
      if (pinnedPhraseWithGroup.phraseGroup.id == props.phraseGroup.id) {
        return true;
      }
      return false;
    }).length > 0;
  }, [props.pinnedPhrasesWithGroups, props.phraseGroup.id]);


  useEffect(() => {
    const timeout = setTimeout(() => {
      setManualSearchText(realManualSearchText ?? "");
    }, 300);
    return () => {
      clearTimeout(timeout);
    };
  }, [realManualSearchText]);

  useEffect(() => {
    setRealManualSearchText(props.searchText ?? "");
  }, [props.searchText, props.selectedTopLevelLocale]);

  const {
    applicationState,
    commandMode,
    compareFrom,
    saveState,
    conflictSet,
    changeset,
  } = useFloroContext();
  const [isReOrderPhrasesMode, setIsReOrderPhrasesMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAddPhraseKey, setShowAddPhraseKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const phraseGroupRef = useQueryRef(
    "$(text).phraseGroups.id<?>",
    props.phraseGroup.id
  );

  const isPinned = useMemo(() => {
    return !!props.pinnedGroups?.includes(phraseGroupRef);
  }, [props.pinnedGroups, phraseGroupRef])

  useEffect(() => {
    if (props.showOnlyPinnedPhrases && isExpanded && !hasPinnedPhrases) {
      setIsExpanded(false);
    }
  }, [hasPinnedPhrases, isExpanded, props.showOnlyPinnedPhrases])

  useEffect(() => {
    if (props.showOnlyPinnedGroups && isExpanded && !isPinned) {
      setIsExpanded(false);
    }
  }, [isPinned, isExpanded, props.showOnlyPinnedGroups])

  const onShowAddPhraseKey = useCallback(() => {
    setShowAddPhraseKey(true);
  }, []);

  const onHideAddPhraseKey = useCallback(() => {
    setShowAddPhraseKey(false);
  }, []);

  const [lastExpanded, setLastExpanded] =
    useClientStorageApi<PointerTypes["$(text).phraseGroups.id<?>"]>(
      "lastExpandedDir"
    );

  const wasRemoved = useWasRemoved(phraseGroupRef, true);
  const wasAdded = useWasAdded(phraseGroupRef, true);
  const hasConflict = useHasConflict(phraseGroupRef, true);

  const [phraseGroup, setPhraseGroup, save] = useFloroState(phraseGroupRef);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    save();
  }, [save]);

  const phrases = useMemo(
    () =>
      phraseGroup?.phrases ??
      ([] as SchemaTypes["$(text).phraseGroups.id<?>.phrases"]),
    [phraseGroup?.phrases]
  );

  const setPhrases = useCallback(
    (
      phrases: SchemaTypes["$(text).phraseGroups.id<?>.phrases"],
      doSave = true
    ) => {
      if (!phraseGroup?.id || !phraseGroup?.name) {
        return;
      }
      setPhraseGroup(
        {
          id: phraseGroup.id,
          name: phraseGroup.name,
          phrases,
        } as SchemaTypes["$(text).phraseGroups.id<?>"],
        doSave
      );
    },
    [phraseGroup, setPhraseGroup]
  );

  const onAddPhraseKey = useCallback(
    (phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"]) => {
      if (!isExpanded) {
        setIsExpanded(true);
      }
      setShowAddPhraseKey(false);
      if (!phraseGroup?.id || !phraseGroup?.name) {
        return;
      }
      const updateFn = setPhraseGroup(
        {
          id: phraseGroup.id,
          name: phraseGroup.name,
          phrases: [phrase, ...(phraseGroup?.phrases ?? [])],
        } as SchemaTypes["$(text).phraseGroups.id<?>"],
        false
      );
      if (updateFn) {
        setTimeout(updateFn, 0);
      }
    },
    [isExpanded, phraseGroupRef, phraseGroup?.phrases, setPhraseGroup]
  );

  useEffect(() => {
    if (hasConflict) {
      setIsExpanded(true);
    }
    //if (wasAdded || wasRemoved || hasConflict) {
    //  setIsExpanded(true);
    //}
  }, [wasAdded, wasRemoved, hasConflict]);

  const onRemovePhrase = useCallback(
    (phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"]) => {
      if (phrases && phraseGroup && applicationState) {
        const filteredPhrases = phrases.filter((v) => v.id != phrase.id);
        setPhrases(filteredPhrases);
      }
    },
    [setPhrases, phraseGroup, phrases, applicationState]
  );

  const onRemoveGroup = useCallback(() => {
    if (props?.phraseGroup) {
      props?.onRemoveGroup?.(props?.phraseGroup);
    }
  }, [props.phraseGroup, props.onRemoveGroup]);

  const onStartReOrderMode = useCallback(() => {
    setIsReOrderPhrasesMode(true);
  }, []);

  const onStopReOrderMode = useCallback(() => {
    setIsReOrderPhrasesMode(false);
  }, []);

  const folderIcon = useMemo(() => {
    if (wasAdded) {
      if (theme.name == "light") {
        return FolderAddedLight;
      }
      return FolderAddedDark;
    }

    if (wasRemoved) {
      if (theme.name == "light") {
        return FolderRemovedLight;
      }
      return FolderRemovedDark;
    }

    if (hasConflict) {
      if (theme.name == "light") {
        return FolderConflictLight;
      }
      return FolderConflictDark;
    }
    if (theme.name == "light") {
      return FolderLight;
    }
    return FolderDark;
  }, [theme.name, wasAdded, wasRemoved, hasConflict]);

  const trashIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);

  const focusIcon = useMemo(() => {
    if (theme.name == "light") {
      return FocusLight;
    }
    return FocusDark;
  }, [theme.name]);

  const searchIcon = useMemo(() => {
    if (theme.name == "light") {
      return SearchLight;
    }
    return SearchDark;
  }, [theme.name]);

  const minusIcon = useMemo(() => {
    if (theme.name == "light") {
      return MinusLight;
    }
    return MinusDark;
  }, [theme.name]);

  const scrollToTopIcon = useMemo(() => {
    if (theme.name == "light") {
      return ScrollToTopLight;
    }
    return ScrollToTopDark;
  }, [theme.name]);

  const folderText = useMemo(() => {
    if (wasAdded) {
      return theme.colors.addedText;
    }

    if (wasRemoved) {
      return theme.colors.removedText;
    }

    if (hasConflict) {
      return theme.colors.conflictText;
    }
    return theme.colors.contrastText;
  }, [theme.name, theme, wasAdded, wasRemoved, hasConflict]);

  const chevronIcon = useMemo(() => {
    if (theme.name == "light") {
      return ChevronLight;
    }
    return ChevronDark;
  }, [theme.name]);

  const isSearching = useMemo(() => props.searchText.trim() != "", [props.searchText]);
  const isManualSearching = useMemo(
    () => manualSearchText.trim() != "",
    [manualSearchText]
  );

  const topLevelLocaleRef = useQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    props.selectedTopLevelLocale
  );
  const hasSearchMatches = useMemo(() => {
    if (!applicationState) {
      return false;
    }
    return getPhrasesGroupHasMatches(
        applicationState,
        phraseGroupRef,
        phrases,
        topLevelLocaleRef,
        props.pinnedPhrases,
        props.showOnlyPinnedPhrases,
        props.filterTag,
        props.globalFilterRequiresUpdate,
        props.globalFilterUntranslated,
        props.searchText
    )
  }, [
    applicationState,
    props.searchText,
    topLevelLocaleRef,
    props?.phraseGroup?.phrases,
    isSearching,
    props.filterTag,
    props.globalFilterRequiresUpdate,
    props.globalFilterUntranslated,
    props.showOnlyPinnedPhrases,
    props.selectedTopLevelLocale,
    props.pinnedPhrases,
  ]);
  const isMounted = useRef(true);
  useEffect(
    () => () => {
      isMounted.current = false;
    },
    []
  );

  const [dimissedUntraslated, setDismissedUntranslated] = useState<Array<string>>([]);
  const [dimissedNeedsUpdate, setDismissedNeedsUpdate] = useState<Array<string>>([]);

  const onFocusPhraseGroup = useCallback(() => {
    setTimeout(() => {
      if (phraseGroupContainer.current) {
        const filtersAdjust = props.showFilters ? 132 : 0;
        props.scrollContainer.scrollTo({
          left: 0,
          top: phraseGroupContainer.current.offsetTop - (236 + filtersAdjust),
          behavior: "smooth",
        });
      }
    }, 50);
  }, [props.showFilters]);

  const onScrollTop = useCallback(() => {
    scrollContainer?.current?.scrollTo?.({left: 0, top: 0});
  }, [props.showFilters]);

  const onToggle = useCallback(() => {
    if (!isExpanded) {
      onFocusPhraseGroup();
    } else {
      props.scrollContainer?.scrollTo?.({left: 0, top: 0, behavior: "smooth"});
    }
    setIsExpanded(!isExpanded);
  }, [
    props.scrollContainer,
    onFocusPhraseGroup,
    props.showFilters,
    isExpanded,
    phraseGroupRef,
    setLastExpanded,
    lastExpanded,
  ]);

  const onReOrderPhrases = useCallback(
    (values: SchemaTypes["$(text).phraseGroups.id<?>.phrases"]) => {
      if (applicationState && phraseGroup?.phrases) {
        setPhrases(values, false);
      }
    },
    [applicationState, phrases]
  );

  const isDisplayingPhrases = useMemo(() => {
    if (
      (isExpanded && !isSearching && !props.isEditingGroups) ||
      (hasSearchMatches && hasSearchMatches)
    ) {
      return true;
    }
    return false;
  }, [
    isExpanded,
    isSearching,
    props.isEditingGroups,
    hasSearchMatches,
    hasSearchMatches,
  ]);

  const phrasesToRender = useMemo(() => {
    if (isDisplayingPhrases) {
      if (!applicationState) {
        return phrases;
      }
      return getPhrasesFilteredForPhraseGroup(
          applicationState,
          phraseGroupRef,
          phrases,
          topLevelLocaleRef,
          props.pinnedPhrases,
          props.showOnlyPinnedPhrases,
          props.filterTag,
          props.globalFilterRequiresUpdate,
          props.globalFilterUntranslated,
          props.searchText
      );
    }
    return [];
  }, [
    applicationState,
    isDisplayingPhrases,
    topLevelLocaleRef,
    phrases,
    props.searchText,
    props.filterTag,
    props.globalFilterRequiresUpdate,
    props.globalFilterUntranslated,
    props.showOnlyPinnedPhrases,
    props.pinnedPhrases,
    props.selectedTopLevelLocale,
  ]);

  const manualPhrasesToRender = useMemo(() => {
    if (!isManualSearching || !applicationState) {
      return phrasesToRender;
    }
    return filterPhrasesOnSearch(phrasesToRender, topLevelLocaleRef, manualSearchText);
  }, [
    props.pinnedPhrases,
    props.showOnlyPinnedPhrases,
    applicationState,
    topLevelLocaleRef,
    phrasesToRender,
    isManualSearching,
    manualSearchText,
    props.selectedTopLevelLocale,
  ]);

  const [renderLimit, setRenderLimit] = useState(RENDER_CONSTANT);
  const [isFocusingPhraseSelector, setIsFocusingPhraseSelector] =
    useState(false);

  useEffect(() => {
    setRenderLimit(RENDER_CONSTANT);
  }, [props.searchText, props.selectedTopLevelLocale]);

  useEffect(() => {
    if (isDisplayingPhrases) {
      if (isReOrderPhrasesMode) {
        setRenderLimit(RENDER_CONSTANT);
        return;
      }
      if (renderLimit < manualPhrasesToRender.length) {
        const timeout = setTimeout(() => {
          setRenderLimit(renderLimit + RENDER_CONSTANT);
        }, 20);
        return () => {
          clearTimeout(timeout);
        };
      }
    } else {
      if (renderLimit != RENDER_CONSTANT) {
        setRenderLimit(RENDER_CONSTANT);
      }
    }
  }, [
    isDisplayingPhrases,
    manualPhrasesToRender,
    renderLimit,
    isReOrderPhrasesMode,
  ]);

  // this allows us to edit searched results
  const memoryLeakedPhrasesToRender = useMemo(() => {
    return manualPhrasesToRender;
  }, [
    props.pinnedPhrases,
    props.showOnlyPinnedPhrases,
    props.searchText,
    props.selectedTopLevelLocale,
    manualSearchText,
    props.filterTag,
    phrases.length,
    isExpanded,
    props.globalFilterRequiresUpdate,
    props.globalFilterUntranslated,
  ]);

  const renderLimitedPhrases = useMemo(() => {
    if (isReOrderPhrasesMode) {
      return phrasesToRender;
    }
    if (!isSearching && !isManualSearching && !props.globalFilterRequiresUpdate && !props.globalFilterUntranslated) {
      return phrasesToRender.slice(0, renderLimit);
    }
    return memoryLeakedPhrasesToRender.slice(0, renderLimit).filter(phrase => {
      if (!phrase?.id) {
        return false;
      }
      if (dimissedNeedsUpdate.includes(phrase.id)) {
        return false;
      }
      if (dimissedUntraslated.includes(phrase.id)) {
        return false;
      }
      return true;
    });
  }, [
    phrasesToRender,
    memoryLeakedPhrasesToRender,
    isSearching,
    props.selectedTopLevelLocale,
    isManualSearching,
    renderLimit,
    isReOrderPhrasesMode,
    dimissedUntraslated,
    dimissedNeedsUpdate
  ]);


  useEffect(() => {
    if (props.globalFilterUntranslated) {
      setDismissedUntranslated([]);
    }
  }, [props.globalFilterUntranslated, memoryLeakedPhrasesToRender])

  useEffect(() => {
    if (props.globalFilterRequiresUpdate) {
      setDismissedNeedsUpdate([]);
    }
  }, [memoryLeakedPhrasesToRender])

  useEffect(() => {
    if (isSearching && isReOrderPhrasesMode) {
      setIsReOrderPhrasesMode(false);
    }
  }, [isSearching, isReOrderPhrasesMode]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault?.();
      controls.start(event, {
        snapToCursor: false,
      });
    },
    [controls]
  );
  const draggerIcon = useMemo(() => {
    if (theme.name == "light") {
      return DraggerLight;
    }
    return DraggerDark;
  }, [theme.name]);

  const hasAnyRemovals = useWasRemoved("$(text).phraseGroups", true);
  const hasAnyAdditions = useWasAdded("$(text).phraseGroups", true);

  useEffect(() => {
    if (isSearching && hasSearchMatches) {
      setIsExpanded(true);
    }
  }, [isSearching, hasSearchMatches]);

  useEffect(() => {
    if (!isExpanded) {
      setIsFocusingPhraseSelector(false);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (isReOrderPhrasesMode && commandMode != "edit") {
      setIsReOrderPhrasesMode(false);
    }
  }, [isReOrderPhrasesMode, commandMode]);

  useEffect(() => {
    if (props.searchText == "" && !props.showOnlyPinnedPhrases && isExpanded) {
      setIsExpanded(false);
      props?.scrollContainer?.scrollTo?.({left: 0, top: 0, behavior: "smooth"});
    }
  }, [
    props.searchText,
    props.showOnlyPinnedPhrases,
    props.filterTag,
    //filterRequiresUpdate,
    //filterUntranslatedForGroup,
    //phrasesToRender.length,
  ]);

  useEffect(() => {
    if (
      props.searchText == "" &&
      props.showOnlyPinnedPhrases &&
      !isExpanded &&
      phrasesToRender.length > 0
    ) {
      setIsExpanded(true);
    }
  }, [
    props.searchText,
    props.showOnlyPinnedPhrases,
    props.filterTag,
    //filterRequiresUpdate,
    //filterUntranslatedForGroup,
    phrasesToRender.length,
  ]);

  const [selectedPhraseRef, setSelectedPhraseRef] =
    useState<PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"] | null>(
      null
    );
  useEffect(() => {
    if (selectedPhraseRef) {
      setSelectedPhraseRef(null);
    }
  }, [selectedPhraseRef]);

  const onSelectPhraseKey = useCallback((option) => {
    setSelectedPhraseRef(
      (option?.value as PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"]) ??
        null
    );
  }, []);

  const phraseKeyOptions = useMemo(() => {
    return renderLimitedPhrases
      .filter((phrase) => {
        if (commandMode == "compare") {
          const phraseRef = makeQueryRef(
            "$(text).phraseGroups.id<?>.phrases.id<?>",
            phraseGroup?.id as string,
            phrase.id as string
          );
          return (
            containsDiffable(changeset, phraseRef, true) ||
            containsDiffable(conflictSet, phraseRef, true)
          );
        }
        return true;
      })
      .map((phrase) => {
        const phraseRef = makeQueryRef(
          "$(text).phraseGroups.id<?>.phrases.id<?>",
          phraseGroup?.id as string,
          phrase.id as string
        );
        return {
          label: phrase.phraseKey,
          value: phraseRef,
        };
      });
  }, [renderLimitedPhrases, commandMode, changeset, conflictSet]);

  const searchBorderColor = useMemo(() => {
    if (theme.name == "light") {
      return ColorPalette.gray;
    }
    return ColorPalette.gray;
  }, [theme.name]);


  useEffect(() => {
    if (props.selectedGroup && props.selectedGroup == phraseGroupRef) {
      if (!isExpanded) {
        setIsExpanded(true);
      }
      onFocusPhraseGroup();
    }
    if (props.selectedGroup && props.selectedGroup != phraseGroupRef) {
      if (isExpanded) {
        setIsExpanded(false);
      }
    }
  }, [props.selectedGroup, isExpanded, onFocusPhraseGroup, phraseGroupRef])

  useEffect(() => {
    if (props.isEditingGroups && isExpanded) {
      setIsExpanded(false);
    }

  }, [isExpanded, props.isEditingGroups])

  useEffect(() => {
    if (isReOrderPhrasesMode && showGroupSearch) {
      setShowGroupSearch(false)
    }

  }, [isReOrderPhrasesMode, showGroupSearch])

  const matchesPinnedPhrases = useMemo(() => {
    const phrasesFilteredByPins = filterPinnedPhrasesFromPhraseGroup(
        phraseGroupRef,
        props.phraseGroup.phrases,
        props.pinnedPhrases,
        props.showOnlyPinnedPhrases
    );
    return phrasesFilteredByPins.length > 0;
  }, [
    phraseGroupRef,
    props.phraseGroup.phrases,
    props.pinnedPhrases,
    props.showOnlyPinnedPhrases
  ]);

  const [isGroupVisible, setIsGroupVisible] = useState(false);

  useEffect(() => {
    if (!props?.scrollContainer) {
      return;
    }
    const onScroll = () => {
      if (!props?.scrollContainer) {
        return;
      }
      if (!phraseGroupContainer.current) {
        return;
      }
      const rect = phraseGroupContainer.current.getBoundingClientRect();
      const scrollRect = props.scrollContainer.getBoundingClientRect();
      const windowHeight = scrollRect.height - 72;
      let isVisible = false;
      if (rect.top > 0) {
        isVisible = rect.top <= windowHeight;
      } else {
        if ((rect.top + rect.height) >= 0) {
          isVisible = true;
        } else {
            isVisible = Math.abs(rect.top + rect.height) < windowHeight;
        }
      }
      setIsGroupVisible(isVisible);
    }
    const onScrollThrottle = throttle(onScroll, 30, { trailing: true, leading: true})
    props.scrollContainer.addEventListener("scroll", onScrollThrottle);
    props.scrollContainer.addEventListener("keydown", onScroll);
    props.scrollContainer.addEventListener("click", onScroll);
    props.scrollContainer.addEventListener("resize", onScroll);
    onScroll();
    const interval = setInterval(onScroll, 100);
    return () => {
      clearInterval(interval);
      if (!props?.scrollContainer) {
        return;
      }
      props.scrollContainer.removeEventListener("scroll", onScrollThrottle);
      props.scrollContainer.removeEventListener("keydown", onScroll);
      props.scrollContainer.removeEventListener("click", onScroll);
      props.scrollContainer.removeEventListener("resize", onScroll);
    }

  }, [props?.scrollContainer])

  if (commandMode == "compare" && !hasConflict) {
    if (!hasAnyRemovals && compareFrom == "before") {
      return null;
    }
    if (!hasAnyAdditions && compareFrom == "after") {
      return null;
    }
  }
  if (!matchesPinnedPhrases) {
    return false;
  }

  if (
    isSearching &&
    phrasesToRender.length == 0
    && memoryLeakedPhrasesToRender.length == 0
  ) {
    return null;
  }
  if (
    !!props.filterTag &&
    phrasesToRender.length == 0 &&
    memoryLeakedPhrasesToRender.length == 0
  ) {
    return null;
  }
  if (
    props.showOnlyPinnedPhrases &&
    phrasesToRender.length == 0 &&
    memoryLeakedPhrasesToRender.length == 0
  ) {
    return null;
  }

  if (
    props.globalFilterRequiresUpdate &&
    phrasesToRender.length == 0 &&
    memoryLeakedPhrasesToRender.length == 0
  ) {
    // show thing here
    return null;
  }

  if (
    props.globalFilterUntranslated &&
    phrasesToRender.length == 0 &&
    memoryLeakedPhrasesToRender.length == 0
  ) {
    // show thing here
    return null;
  }

  const container = (
    <Container
      ref={phraseGroupContainer}
      style={{
        borderTop: props.isEditingGroups
          ? `0px`
          : `1px solid ${ColorPalette.gray}`,
      }}
    >
      <AddPhraseModal
        show={showAddPhraseKey && commandMode == "edit"}
        onDismiss={onHideAddPhraseKey}
        onAdd={onAddPhraseKey}
        phraseGroup={props.phraseGroup}
      />
      <StickRow
        ref={sticky}
        style={{
          top: props.showFilters ? 368 : 236,
          background: !props.isEditingGroups ? theme.background : "transparent",
          boxShadow: !isExpanded
            ? `0px 0px 0px ${theme.shadows.outerDropdown}`
            : `-4px 4px 2px 2px ${theme.shadows.outerDropdown}`,
        }}
      >
        <TopRow>
          <FolderRow>
            {props.isEditingGroups && commandMode == "edit" && (
              <DragShadeContainer onPointerDown={onPointerDown}>
                <DragIcon src={draggerIcon} />
              </DragShadeContainer>
            )}
            <FolderIcon onClick={onToggle} src={folderIcon} />
            <Title style={{ color: folderText }} onClick={onToggle}>
              {props.phraseGroup.name}
            </Title>
            {props.isEditingGroups && commandMode == "edit" && (
              <>
                <DeleteShadeContainer onClick={onRemoveGroup}>
                  <DeleteShade src={trashIcon} />
                </DeleteShadeContainer>
              </>
            )}
            {(phrases?.length ?? 0) > 0 && !props.isEditingGroups && (
              <>
                <ChevronWrapper onClick={onToggle}>
                  <ChevronIcon
                    src={chevronIcon}
                    style={{
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  />
                </ChevronWrapper>
              </>
            )}
          </FolderRow>
          <AddRow>
            {
              <>
                {isExpanded && !isReOrderPhrasesMode && (
                  <div style={{ marginTop: -24 }}>
                    <div style={{ display: "flex" }}>
                      <InputSelector
                        value={selectedPhraseRef}
                        size={"mid"}
                        options={phraseKeyOptions}
                        label={"phrase key"}
                        placeholder={"select phrase key"}
                        onChange={onSelectPhraseKey}
                        onOpen={() => {
                          setIsFocusingPhraseSelector(true);
                        }}
                        onClose={() => {
                          setIsFocusingPhraseSelector(false);
                        }}
                      />
                    </div>
                  </div>
                )}
                {commandMode == "edit" && !props.isEditingGroups && (
                  <div style={{ width: 180, marginLeft: 24 }}>
                    <Button
                      onClick={onShowAddPhraseKey}
                      label={"+ add phrase"}
                      bg={"teal"}
                      size={"medium"}
                    />
                  </div>
                )}
              </>
            }
          </AddRow>
        </TopRow>
        {!props.isEditingGroups && (
          <>
            <Row
              style={{
                padding: "0px 48px 8px 24px",
                height: 72,
              }}
            >
              <div
                style={{
                  height: 72,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    marginRight: 24,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Checkbox
                    isChecked={isPinned}
                    onChange={() => {
                      if (isPinned) {
                        props.setPinnedGroups(props.pinnedGroups?.filter(p => p != phraseGroupRef) ?? []);
                      } else {
                        props.setPinnedGroups([...(props.pinnedGroups?.filter(p => p != phraseGroupRef) ?? []), phraseGroupRef]);
                      }
                    }}
                  />
                  <span style={{ marginLeft: 12 }}>
                    <PinPhrase>{"Pin Group"}</PinPhrase>
                  </span>
                </span>
                {isExpanded && !isReOrderPhrasesMode && (
                  <>
                    <span
                      onClick={onFocusPhraseGroup}
                      style={{ marginLeft: 0, marginTop: 8 }}
                    >
                      <FocusIcon src={focusIcon} />
                    </span>
                    <span
                      onClick={() => {
                        //setShowGroupSearch(!showGroupSearch);
                      }}
                      style={{ marginLeft: 24, marginTop: 8 }}
                    >
                      <ScrollTopIcon
                        onClick={onScrollTop}
                        src={scrollToTopIcon}
                      />
                    </span>
                    <span
                      onClick={() => {
                        setShowGroupSearch(!showGroupSearch);
                        onFocusPhraseGroup();
                      }}
                      style={{ marginLeft: 24, marginTop: 8 }}
                    >
                      <PlusIcon
                        src={showGroupSearch ? minusIcon : searchIcon}
                      />
                    </span>
                  </>
                )}
              </div>

              {commandMode == "edit" &&
                isExpanded &&
                !isSearching &&
                !(props.showOnlyPinnedPhrases && props.pinnedPhrases) &&
                !props.filterTag &&
                (props?.phraseGroup?.phrases?.length ?? 0) > 0 &&
                !props.isEditingGroups && (
                  <SubTitleRow>
                    {!isReOrderPhrasesMode && (
                      <SubTitle
                        onClick={onStartReOrderMode}
                      >{`organize ${props.phraseGroup.name} phrases`}</SubTitle>
                    )}
                    {isReOrderPhrasesMode && (
                      <SubTitle
                        onClick={onStopReOrderMode}
                      >{`done organizing ${props.phraseGroup.name} phrases`}</SubTitle>
                    )}
                  </SubTitleRow>
                )}
            </Row>
            <div
              style={{
                transition: "height 100ms",
                borderTop: `1px solid ${ColorPalette.gray}`,
                height: isExpanded && showGroupSearch ? 96 : 0,
                width: "100%",
                overflow: "hidden",
              }}
            >
              {(phrases?.length ?? 0) > 0 &&
                !isReOrderPhrasesMode &&
                isExpanded &&
                !props.isEditingGroups && (
                  <div
                    style={{
                      marginTop: 0,
                      width: "100%",
                      paddingRight: 48,
                    }}
                  >
                    <Row style={{ marginTop: 24, paddingLeft: 16 }}>
                      <SearchInput
                        value={realManualSearchText}
                        placeholder={`subsearch ${phraseGroup?.name ?? ""}`}
                        borderColor={searchBorderColor}
                        onTextChanged={(text) => {
                          setRealManualSearchText(text);
                          onScrollTop();
                        }}
                        width={480}
                        showClear
                        onFocus={() => {
                          setIsFocusingSearch(true);
                          onFocusPhraseGroup();
                        }}
                        onBlur={() => {
                          setIsFocusingSearch(false);
                        }}
                      />
                    </Row>
                  </div>
                )}
            </div>
          </>
        )}
      </StickRow>
      {isExpanded && (
        <div
          ref={scrollContainer}
          style={{
            paddingTop: 80,
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: 300,
            minHeight: 700,
            height: "100vh",
            overflowY: "auto",
            resize: "vertical",
            borderTop: `1px solid ${ColorPalette.gray}`,
            borderBottom: `1px solid ${ColorPalette.gray}`,
            background:
              theme.name == "light"
                ? ColorPalette.extraLightGray
                : ColorPalette.darkerGray,
          }}
        >
          {phraseKeyOptions.length == 0 && (
            <div>
              {commandMode == "compare" && (
                <Row style={{ alignItems: "center", justifyContent: "center" }}>
                  <Title>{"No phrases to show in diff"}</Title>
                </Row>
              )}
            </div>
          )}
          {
            <>
              {!isReOrderPhrasesMode &&
                renderLimitedPhrases?.map?.((phrase, index) => {
                  const phraseRef = makeQueryRef(
                    "$(text).phraseGroups.id<?>.phrases.id<?>",
                    phraseGroup?.id as string,
                    phrase.id as string
                  );
                  return (
                    <PhraseRow
                      globalFilterRequiresUpdate={props.globalFilterRequiresUpdate}
                      globalFilterUntranslated={props.globalFilterUntranslated}
                      pinnedPhrases={props.pinnedPhrases}
                      setPinnedPhrases={props.setPinnedPhrases}
                      phraseRef={phraseRef}
                      selectedTopLevelLocale={props.selectedTopLevelLocale}
                      key={phraseRef}
                      index={index}
                      phrase={phrase}
                      onRemove={onRemovePhrase}
                      phraseGroup={props.phraseGroup}
                      scrollContainer={
                        scrollContainer?.current as HTMLDivElement
                      }
                      searchText={manualSearchText}
                      selectedPhraseRef={selectedPhraseRef}
                      showOnlyPinnedPhrases={props.showOnlyPinnedPhrases}
                      isFocusingPhraseSelector={isFocusingPhraseSelector || isFocusingSearch}
                      isGroupVisible={isGroupVisible}
                      onSetDismissedUnTranslated={(phraseId) => {
                        setDismissedUntranslated([...dimissedUntraslated, phraseId])
                      }}
                      onSetDismissedRequiredUpdated={(phraseId) => {
                        setDismissedNeedsUpdate([...dimissedNeedsUpdate, phraseId])
                      }}
                    />
                  );
                })}
            </>
          }
          {isReOrderPhrasesMode && (
            <AnimatePresence>
              <Reorder.Group
                axis="y"
                values={phrases ?? []}
                onReorder={onReOrderPhrases}
                style={{ listStyle: "none", margin: 0, padding: 0 }}
              >
                {phrases?.map?.((phrase, index) => {
                  return (
                    <PhraseReOrderRow
                      key={phrase.id}
                      phrase={phrase}
                      index={index}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                    />
                  );
                })}
              </Reorder.Group>
            </AnimatePresence>
          )}
        </div>
      )}
    </Container>
  );
  if (!props.isEditingGroups) {
    return <>{container}</>;
  }
  return (
    <Reorder.Item
      dragListener={false}
      dragControls={controls}
      value={props.phraseGroup}
      variants={colorPaletteItemVariants}
      initial={"hidden"}
      animate={"visible"}
      exit={"hidden"}
      layoutId={props.phraseGroup.id}
      custom={(props.index + 1) * 0.005}
      whileHover={{ scale: 1 }}
      whileDrag={{ scale: 1.02 }}
      key={phraseGroupRef}
      style={{ position: "relative", listStyle: "none" }}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
    >
      {container}
    </Reorder.Item>
  );
};

export default React.memo(PhraseGroup);
