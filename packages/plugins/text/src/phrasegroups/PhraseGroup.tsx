import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import {
  PointerTypes,
  SchemaTypes,
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

import ColorPalette from "@floro/styles/ColorPalette";
import { AnimatePresence, Reorder, useDragControls } from "framer-motion";
import Button from "@floro/storybook/stories/design-system/Button";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import AddPhraseModal from "../phrases/AddPhraseModal";
import PhraseReOrderRow from "../phrases/PhraseReOrderRow";
import PhraseRow from "../phrases/PhraseRow";

const Container = styled.div`
  margin-bottom: 24px;
  min-width: 1020px;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
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
  showOnlyPinnedPhrases: boolean;
  pinnedPhrases: Array<string> | null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  removePinnedPhrases: () => void;
}

const PhraseGroup = (props: Props) => {
  const theme = useTheme();
  const controls = useDragControls();

  const { applicationState, commandMode, compareFrom, saveState } =
    useFloroContext();
  const [isReOrderPhrasesMode, setIsReOrderPhrasesMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAddPhraseKey, setShowAddPhraseKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterUntranslatedForGroup, setFilterUntranslatedForGroup] =
    useState(false);
  const [filterRequiresUpdate, setFilterRequiresUpdate] = useState(false);
  const phraseGroupRef = useQueryRef(
    "$(text).phraseGroups.id<?>",
    props.phraseGroup.id
  );

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
  const onAddPhraseKey = useCallback(() => {
    if (!isExpanded) {
      setIsExpanded(true);
      setLastExpanded(phraseGroupRef);
    }
    setShowAddPhraseKey(false);
  }, [isExpanded, phraseGroupRef]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (
        commandMode != "compare" &&
        lastExpanded &&
        phraseGroupRef == lastExpanded
      ) {
        setIsExpanded(true);
      }
    });
    return () => {
      clearTimeout(timeout);
    };
  }, [lastExpanded, commandMode, phraseGroupRef]);

  useEffect(() => {
    setFilterUntranslatedForGroup(props.globalFilterUntranslated);
  }, [props.globalFilterUntranslated]);

  useEffect(() => {
    setFilterRequiresUpdate(props.globalFilterRequiresUpdate);
  }, [props.globalFilterRequiresUpdate]);

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
    [phraseGroup]
  );

  useEffect(() => {
    if (wasAdded || wasRemoved || hasConflict) {
      setIsExpanded(true);
    }
  }, [wasAdded, wasRemoved, hasConflict]);

  const onRemovePhrase = useCallback(
    (phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"]) => {
      if (phrases && phraseGroup && applicationState) {
        const filteredPhrases = phrases.filter((v) => v.id != phrase.id);
        setPhrases(filteredPhrases);
      }
    },
    [phraseGroup, phrases, applicationState]
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

  const editIcon = useMemo(() => {
    if (theme.name == "light") {
      return EditLight;
    }
    return EditDark;
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

  const isSearching = useMemo(
    () => props.searchText.trim() != "",
    [props.searchText]
  );

  const topLevelLocaleRef = useQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    props.selectedTopLevelLocale
  );
  const hasSearchMatches = useMemo(() => {
    if (!applicationState) {
      return false;
    }
    if (props.showOnlyPinnedPhrases && props.pinnedPhrases) {
      for (const phrase of props.phraseGroup.phrases) {
        const phraseRef = `${phraseGroupRef}.phrases.id<${phrase.id}>`;
        if (props.pinnedPhrases?.includes(phraseRef)) {
          return true;
        }
      }
      return false;
    }
    const locale = getReferencedObject(applicationState, topLevelLocaleRef);
    const localeSettings = getReferencedObject(
      applicationState,
      "$(text).localeSettings"
    );
    const defaultLocale = localeSettings.locales.find(
      (l) =>
        makeQueryRef(
          "$(text).localeSettings.locales.localeCode<?>",
          l.localeCode
        ) == localeSettings.defaultLocaleRef
    );
    const translateFromLocale = locale.defaultTranslateFromLocaleRef
      ? getReferencedObject(
          applicationState,
          locale.defaultTranslateFromLocaleRef
        )
      : defaultLocale;
    const translateFromLocaleRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      translateFromLocale?.localeCode as string
    );
    const shouldSkipUpdates =
      topLevelLocaleRef == locale.defaultTranslateFromLocaleRef &&
      (!locale.defaultTranslateFromLocaleRef ||
        locale.defaultFallbackLocaleRef == translateFromLocaleRef);
    if (!isSearching) {
      const filteredPhrases = props?.phraseGroup?.phrases
        ?.filter((phrase) => {
          if (props.filterTag) {
            return phrase.tags.includes(props.filterTag);
          }
          return true;
        })
        ?.filter((phrase) => {
          if (!filterUntranslatedForGroup) {
            return true;
          }
          const phraseRef = `${phraseGroupRef}.phrases.id<${phrase.id}>`;
          if (props.pinnedPhrases?.includes(phraseRef)) {
            return true;
          }
          if (!phrase.usePhraseSections) {
            for (let localeGroup of phrase.phraseTranslations ?? []) {
              if (localeGroup.id != topLevelLocaleRef) {
                continue;
              }
              if ((localeGroup.plainText ?? "").trim() == "") {
                return true;
              }
            }
          } else {
            for (let phraseSection of phrase?.phraseSections ?? []) {
              if ((phraseSection.name ?? "").trim() == "") {
                return true;
              }
              for (let translation of phraseSection.localeRules ?? []) {
                if (translation.id != topLevelLocaleRef) {
                  continue;
                }
                if ((translation.displayValue.plainText ?? "").trim() == "") {
                  return true;
                }
                if ((translation.displayValue.plainText ?? "").trim() == "") {
                  return true;
                }
              }
            }
          }

          for (let styledContent of phrase?.styledContents ?? []) {
            if ((styledContent.name ?? "").trim() == "") {
              return true;
            }
            for (let translation of styledContent.localeRules ?? []) {
              if (translation.id != topLevelLocaleRef) {
                continue;
              }
              if ((translation.displayValue.plainText ?? "").trim() == "") {
                return true;
              }
              if ((translation.displayValue.plainText ?? "").trim() == "") {
                return true;
              }
            }
          }

          for (let linkVariable of phrase?.linkVariables ?? []) {
            if ((linkVariable.linkName ?? "").trim() == "") {
              return true;
            }
            for (let translation of linkVariable.translations ?? []) {
              if (translation.id != topLevelLocaleRef) {
                continue;
              }
              if ((translation.linkDisplayValue.plainText ?? "").trim() == "") {
                return true;
              }
              if ((translation.linkHrefValue.plainText ?? "").trim() == "") {
                return true;
              }
            }
          }
          for (let variant of phrase?.interpolationVariants ?? []) {
            for (let translation of variant?.localeRules ?? []) {
              if (translation.id != topLevelLocaleRef) {
                continue;
              }
              if ((translation.defaultValue?.plainText ?? "").trim() == "") {
                return true;
              }

              for (let conditional of translation.conditionals ?? []) {
                if ((conditional?.resultant?.plainText ?? "").trim() == "") {
                  return true;
                }
              }
            }
          }
          return false;
        })
        ?.filter((phrase) => {
          if (!filterRequiresUpdate) {
            return true;
          }
          if (shouldSkipUpdates) {
            return false;
          }

          if (phrase.usePhraseSections) {
            for (let phraseSection of phrase?.phraseSections ?? []) {
              if ((phraseSection.name ?? "").trim() == "") {
                return true;
              }
              for (let translation of phraseSection.localeRules ?? []) {
                if (translation.id != topLevelLocaleRef) {
                  continue;
                }
                const translateFromDisplayValue = phraseSection.localeRules.find(
                  (l) => l.id == translateFromLocaleRef
                );
                if (
                  (translation.displayValue.revisionCount ?? 0) <
                  (translateFromDisplayValue?.displayValue?.revisionCount ??
                    0)
                ) {
                  return true;
                }
              }
            }
          } else {
            for (let localeGroup of phrase.phraseTranslations ?? []) {
              if (localeGroup.id != topLevelLocaleRef) {
                continue;
              }
              const translateFrom = phrase.phraseTranslations.find(
                (l) => l.id == translateFromLocaleRef
              );
              if (
                (localeGroup.revisionCount ?? 0) <
                (translateFrom?.revisionCount ?? 0)
              ) {
                return true;
              }
            }
          }

          for (let linkVariable of phrase?.linkVariables ?? []) {
            if ((linkVariable.linkName ?? "").trim() == "") {
              return true;
            }
            for (let translation of linkVariable.translations ?? []) {
              if (translation.id != topLevelLocaleRef) {
                continue;
              }
              const translateFromDisplayValue = linkVariable.translations.find(
                (l) => l.id == translateFromLocaleRef
              );
              if (
                (translation.linkDisplayValue.revisionCount ?? 0) <
                (translateFromDisplayValue?.linkDisplayValue?.revisionCount ??
                  0)
              ) {
                return true;
              }
              const translateFromHrefValue = linkVariable.translations.find(
                (l) => l.id == translateFromLocaleRef
              );
              if (
                (translation.linkHrefValue.revisionCount ?? 0) <
                (translateFromHrefValue?.linkHrefValue?.revisionCount ?? 0)
              ) {
                return true;
              }
            }
          }
          for (let variant of phrase?.interpolationVariants ?? []) {
            for (let translation of variant?.localeRules ?? []) {
              if (translation.id != topLevelLocaleRef) {
                continue;
              }
              const translateFrom = variant?.localeRules.find(
                (l) => l.id == translateFromLocaleRef
              );
              if (
                (translation.defaultValue.revisionCount ?? 0) <
                (translateFrom?.defaultValue?.revisionCount ?? 0)
              ) {
                return true;
              }
            }
          }
          for (let styledContent of phrase?.styledContents ?? []) {
            for (let translation of styledContent?.localeRules ?? []) {
              if (translation.id != topLevelLocaleRef) {
                continue;
              }
              const translateFrom = styledContent?.localeRules.find(
                (l) => l.id == translateFromLocaleRef
              );
              if (
                (translation.displayValue.revisionCount ?? 0) <
                (translateFrom?.displayValue?.revisionCount ?? 0)
              ) {
                return true;
              }
            }
          }
          return false;
        });
      if (
        props.filterTag ||
        filterUntranslatedForGroup ||
        filterRequiresUpdate
      ) {
        return filteredPhrases.length > 0;
      }
      return false;
    }
    const filteredPhrases = props?.phraseGroup?.phrases?.filter((phrase) => {
      if (props.filterTag) {
        return phrase.tags.includes(props.filterTag);
      }
      return true;
    });

    for (const phrase of filteredPhrases ?? []) {
      if (
        (phrase?.phraseKey ?? "")
          ?.toLowerCase()
          .indexOf(props.searchText.toLowerCase().trim()) != -1 ||
        (phrase?.description?.value ?? "")
          ?.toLowerCase()
          .indexOf(props.searchText.toLowerCase().trim()) != -1
      ) {
        return true;
      }
      if (phrase.usePhraseSections) {
        for (let phraseSection of phrase?.phraseSections ?? []) {
          if (
            (phraseSection.name ?? "")
              ?.toLowerCase()
              .indexOf(props.searchText.toLowerCase().trim()) != -1
          ) {
            return true;
          }
          for (let translation of phraseSection.localeRules ?? []) {
            if (translation.id != topLevelLocaleRef) {
              continue;
            }
            if (
              (translation.displayValue.plainText ?? "")
                ?.toLowerCase()
                .indexOf(props.searchText.toLowerCase().trim()) != -1
            ) {
              return true;
            }
          }
        }
      } else {
        for (let localeGroup of phrase.phraseTranslations ?? []) {
          if (localeGroup.id != topLevelLocaleRef) {
            continue;
          }
          if (
            (localeGroup.plainText ?? "")
              ?.toLowerCase()
              .indexOf(props.searchText.toLowerCase().trim()) != -1
          ) {
            return true;
          }
        }
      }
      for (let variable of phrase?.variables ?? []) {
        if (
          (variable.name ?? "")
            ?.toLowerCase()
            .indexOf(props.searchText.toLowerCase().trim()) != -1
        ) {
          return true;
        }
      }
      for (let contentVariable of phrase?.contentVariables ?? []) {
        if (
          (contentVariable.name ?? "")
            ?.toLowerCase()
            .indexOf(props.searchText.toLowerCase().trim()) != -1
        ) {
          return true;
        }
      }
      for (let styleClass of phrase?.styleClasses ?? []) {
        if (
          (styleClass.name ?? "")
            ?.toLowerCase()
            .indexOf(props.searchText.toLowerCase().trim()) != -1
        ) {
          return true;
        }
      }

      for (let styledContent of phrase?.styledContents ?? []) {
        if (
          (styledContent.name ?? "")
            ?.toLowerCase()
            .indexOf(props.searchText.toLowerCase().trim()) != -1
        ) {
          return true;
        }
        for (let translation of styledContent.localeRules ?? []) {
          if (translation.id != topLevelLocaleRef) {
            continue;
          }
          if (
            (translation.displayValue.plainText ?? "")
              ?.toLowerCase()
              .indexOf(props.searchText.toLowerCase().trim()) != -1
          ) {
            return true;
          }
        }
      }
      for (let linkVariable of phrase?.linkVariables ?? []) {
        if (
          (linkVariable.linkName ?? "")
            ?.toLowerCase()
            .indexOf(props.searchText.toLowerCase().trim()) != -1
        ) {
          return true;
        }
        for (let translation of linkVariable.translations ?? []) {
          if (translation.id != topLevelLocaleRef) {
            continue;
          }
          if (
            (translation.linkDisplayValue.plainText ?? "")
              ?.toLowerCase()
              .indexOf(props.searchText.toLowerCase().trim()) != -1
          ) {
            return true;
          }
          if (
            (translation.linkHrefValue.plainText ?? "")
              ?.toLowerCase()
              .indexOf(props.searchText.toLowerCase().trim()) != -1
          ) {
            return true;
          }
        }
      }
      for (let variant of phrase?.interpolationVariants ?? []) {
        for (let translation of variant?.localeRules ?? []) {
          if (translation.id != topLevelLocaleRef) {
            continue;
          }
          if (
            (translation.defaultValue?.plainText ?? "")
              ?.toLowerCase()
              .indexOf(props.searchText.toLowerCase().trim()) != -1
          ) {
            return true;
          }

          for (let conditional of translation.conditionals ?? []) {
            if (
              (conditional?.resultant?.plainText ?? "")
                ?.toLowerCase()
                .indexOf(props.searchText.toLowerCase().trim()) != -1
            ) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }, [
    applicationState,
    props.searchText,
    topLevelLocaleRef,
    props?.phraseGroup?.phrases,
    isSearching,
    props.filterTag,
    filterUntranslatedForGroup,
    filterRequiresUpdate,
    props.showOnlyPinnedPhrases,
    props.pinnedPhrases,
  ]);

  const onToggle = useCallback(() => {
    if (!isExpanded) {
      setLastExpanded(phraseGroupRef);
    } else if (phraseGroupRef == lastExpanded) {
      setLastExpanded(null);
    }
    setIsExpanded(!isExpanded);
  }, [isExpanded, phraseGroupRef, setLastExpanded, lastExpanded]);

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
      if (props.showOnlyPinnedPhrases && props.pinnedPhrases) {
        return phrases?.filter((phrase) => {
          const phraseRef = `${phraseGroupRef}.phrases.id<${phrase.id}>`;
          return props.pinnedPhrases?.includes(phraseRef);
        });
      }
      const locale = getReferencedObject(applicationState, topLevelLocaleRef);
      const localeSettings = getReferencedObject(
        applicationState,
        "$(text).localeSettings"
      );
      const defaultLocale = localeSettings.locales.find(
        (l) =>
          makeQueryRef(
            "$(text).localeSettings.locales.localeCode<?>",
            l.localeCode
          ) == localeSettings.defaultLocaleRef
      );
      const translateFromLocale = locale.defaultTranslateFromLocaleRef
        ? getReferencedObject(
            applicationState,
            locale.defaultTranslateFromLocaleRef
          )
        : defaultLocale;
      const translateFromLocaleRef = makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        translateFromLocale?.localeCode as string
      );
      const shouldSkipUpdates =
        topLevelLocaleRef == locale.defaultTranslateFromLocaleRef &&
        (!locale.defaultTranslateFromLocaleRef ||
          locale.defaultFallbackLocaleRef == translateFromLocaleRef);
      return phrases
        ?.filter((phrase) => {
          if (props.filterTag) {
            return phrase.tags.includes(props.filterTag);
          }
          return true;
        })
        ?.filter((phrase) => {
          if (props.filterTag) {
            return phrase.tags.includes(props.filterTag);
          }
          return true;
        })
        ?.filter((phrase) => {
          if (!filterUntranslatedForGroup) {
            return true;
          }
          const phraseRef = `${phraseGroupRef}.phrases.id<${phrase.id}>`;
          if (props.pinnedPhrases?.includes(phraseRef)) {
            return true;
          }
          if (phrase.usePhraseSections) {
            for (let phraseSection of phrase?.phraseSections ?? []) {
              if ((phraseSection.name ?? "").trim() == "") {
                return true;
              }
              for (let translation of phraseSection.localeRules ?? []) {
                if (translation.id != topLevelLocaleRef) {
                  continue;
                }
                if ((translation.displayValue.plainText ?? "").trim() == "") {
                  return true;
                }
                if ((translation.displayValue.plainText ?? "").trim() == "") {
                  return true;
                }
              }
            }

          } else {
            for (let localeGroup of phrase.phraseTranslations ?? []) {
              if (localeGroup.id != topLevelLocaleRef) {
                continue;
              }
              if ((localeGroup.plainText ?? "").trim() == "") {
                return true;
              }
            }
          }

          for (let linkVariable of phrase?.linkVariables ?? []) {
            if ((linkVariable.linkName ?? "").trim() == "") {
              return true;
            }
            for (let translation of linkVariable.translations ?? []) {
              if (translation.id != topLevelLocaleRef) {
                continue;
              }
              if ((translation.linkDisplayValue.plainText ?? "").trim() == "") {
                return true;
              }
              if ((translation.linkHrefValue.plainText ?? "").trim() == "") {
                return true;
              }
            }
          }
          for (let variant of phrase?.interpolationVariants ?? []) {
            for (let translation of variant?.localeRules ?? []) {
              if (translation.id != topLevelLocaleRef) {
                continue;
              }
              if ((translation.defaultValue?.plainText ?? "").trim() == "") {
                return true;
              }

              for (let conditional of translation.conditionals ?? []) {
                if ((conditional?.resultant?.plainText ?? "").trim() == "") {
                  return true;
                }
              }
            }
          }
          for (let styledContent of phrase?.styledContents ?? []) {
            for (let translation of styledContent?.localeRules ?? []) {
              if (translation.id != topLevelLocaleRef) {
                continue;
              }
              if ((translation.displayValue?.plainText ?? "").trim() == "") {
                return true;
              }
            }
          }
          return false;
        })
        ?.filter((phrase) => {
          if (!filterRequiresUpdate) {
            return true;
          }
          if (shouldSkipUpdates) {
            return false;
          }
          if (phrase.usePhraseSections) {
            for (let phraseSection of phrase?.phraseSections ?? []) {
              if ((phraseSection.name ?? "").trim() == "") {
                return true;
              }
              for (let translation of phraseSection.localeRules ?? []) {
                if (translation.id != topLevelLocaleRef) {
                  continue;
                }
                const translateFromDisplayValue = phraseSection.localeRules.find(
                  (l) => l.id == translateFromLocaleRef
                );
                if (
                  (translation.displayValue.revisionCount ?? 0) <
                  (translateFromDisplayValue?.displayValue?.revisionCount ??
                    0)
                ) {
                  return true;
                }
              }
            }
          } else {
            for (let localeGroup of phrase.phraseTranslations ?? []) {
              if (localeGroup.id != topLevelLocaleRef) {
                continue;
              }
              const translateFrom = phrase.phraseTranslations.find(
                (l) => l.id == translateFromLocaleRef
              );
              if (
                (localeGroup.revisionCount ?? 0) <
                (translateFrom?.revisionCount ?? 0)
              ) {
                return true;
              }
            }
          }

          for (let linkVariable of phrase?.linkVariables ?? []) {
            if ((linkVariable.linkName ?? "").trim() == "") {
              return true;
            }
            for (let translation of linkVariable.translations ?? []) {
              if (translation.id != topLevelLocaleRef) {
                continue;
              }
              const translateFromDisplayValue = linkVariable.translations.find(
                (l) => l.id == translateFromLocaleRef
              );
              if (
                (translation.linkDisplayValue.revisionCount ?? 0) <
                (translateFromDisplayValue?.linkDisplayValue?.revisionCount ??
                  0)
              ) {
                return true;
              }
              const translateFromHrefValue = linkVariable.translations.find(
                (l) => l.id == translateFromLocaleRef
              );
              if (
                (translation.linkHrefValue.revisionCount ?? 0) <
                (translateFromHrefValue?.linkHrefValue?.revisionCount ?? 0)
              ) {
                return true;
              }
            }
          }
          for (let variant of phrase?.interpolationVariants ?? []) {
            for (let translation of variant?.localeRules ?? []) {
              if (translation.id != topLevelLocaleRef) {
                continue;
              }
              const translateFrom = variant?.localeRules.find(
                (l) => l.id == translateFromLocaleRef
              );
              if (
                (translation.defaultValue.revisionCount ?? 0) <
                (translateFrom?.defaultValue?.revisionCount ?? 0)
              ) {
                return true;
              }
            }
          }
          for (let styledContent of phrase?.styledContents ?? []) {
            for (let translation of styledContent?.localeRules ?? []) {
              if (translation.id != topLevelLocaleRef) {
                continue;
              }
              const translateFrom = styledContent?.localeRules.find(
                (l) => l.id == translateFromLocaleRef
              );
              if (
                (translation.displayValue.revisionCount ?? 0) <
                (translateFrom?.displayValue?.revisionCount ?? 0)
              ) {
                return true;
              }
            }
          }
          return false;
        })
        .filter?.((phrase) => {
          if (!phrase?.phraseKey) {
            return false;
          }
          if (
            (phrase?.phraseKey ?? "")
              ?.toLowerCase()
              .indexOf(props.searchText.toLowerCase().trim()) != -1 ||
            (phrase?.description?.value ?? "")
              ?.toLowerCase()
              .indexOf(props.searchText.toLowerCase().trim()) != -1
          ) {
            return true;
          }
          if (phrase.usePhraseSections) {
            for (let phraseSection of phrase?.phraseSections ?? []) {
              if (
                (phraseSection.name ?? "")
                  ?.toLowerCase()
                  .indexOf(props.searchText.toLowerCase().trim()) != -1
              ) {
                return true;
              }
              for (let localeRule of phraseSection.localeRules ?? []) {
                if (localeRule.id != topLevelLocaleRef) {
                  continue;
                }
                if (
                  (localeRule?.displayValue?.plainText ?? "")
                    ?.toLowerCase()
                    .indexOf(props.searchText.toLowerCase().trim()) != -1
                ) {
                  return true;
                }
              }
            }
          } else {
            for (let localeGroup of phrase?.phraseTranslations ?? []) {
              if (localeGroup.id != topLevelLocaleRef) {
                continue;
              }
              if (
                (localeGroup.plainText ?? "")
                  ?.toLowerCase()
                  .indexOf(props.searchText.toLowerCase().trim()) != -1
              ) {
                return true;
              }
            }
          }
          for (let variable of phrase?.variables ?? []) {
            if (
              (variable.name ?? "")
                ?.toLowerCase()
                .indexOf(props.searchText.toLowerCase().trim()) != -1
            ) {
              return true;
            }
          }
          for (let contentVariable of phrase?.contentVariables ?? []) {
            if (
              (contentVariable.name ?? "")
                ?.toLowerCase()
                .indexOf(props.searchText.toLowerCase().trim()) != -1
            ) {
              return true;
            }
          }
          for (let styleClass of phrase?.styleClasses ?? []) {
            if (
              (styleClass.name ?? "")
                ?.toLowerCase()
                .indexOf(props.searchText.toLowerCase().trim()) != -1
            ) {
              return true;
            }
          }
          for (let linkVariable of phrase?.linkVariables ?? []) {
            if (
              (linkVariable.linkName ?? "")
                ?.toLowerCase()
                .indexOf(props.searchText.toLowerCase().trim()) != -1
            ) {
              return true;
            }
            for (let translation of linkVariable.translations ?? []) {
              if (translation.id != topLevelLocaleRef) {
                continue;
              }
              if (
                (translation?.linkDisplayValue?.plainText ?? "")
                  ?.toLowerCase()
                  .indexOf(props.searchText.toLowerCase().trim()) != -1
              ) {
                return true;
              }
              if (
                (translation?.linkHrefValue?.plainText ?? "")
                  ?.toLowerCase()
                  .indexOf(props.searchText.toLowerCase().trim()) != -1
              ) {
                return true;
              }
            }
          }

          for (let phraseSection of phrase?.phraseSections ?? []) {
            for (let localeRule of phraseSection?.localeRules ?? []) {
              if (localeRule.id != topLevelLocaleRef) {
                continue;
              }
              if (
                (localeRule.displayValue?.plainText ?? "")
                  ?.toLowerCase()
                  .indexOf(props.searchText.toLowerCase().trim()) != -1
              ) {
                return true;
              }
            }
          }

          for (let variant of phrase?.interpolationVariants ?? []) {
            for (let translation of variant?.localeRules ?? []) {
              if (translation.id != topLevelLocaleRef) {
                continue;
              }
              if (
                (translation.defaultValue?.plainText ?? "")
                  ?.toLowerCase()
                  .indexOf(props.searchText.toLowerCase().trim()) != -1
              ) {
                return true;
              }

              for (let conditional of translation.conditionals ?? []) {
                if (
                  (conditional?.resultant?.plainText ?? "")
                    ?.toLowerCase()
                    .indexOf(props.searchText.toLowerCase().trim()) != -1
                ) {
                  return true;
                }
              }
            }
          }
          return false;
        });
    }
    return [];
  }, [
    applicationState,
    isDisplayingPhrases,
    topLevelLocaleRef,
    phrases,
    props.searchText,
    props.filterTag,
    filterUntranslatedForGroup,
    filterRequiresUpdate,
    props.showOnlyPinnedPhrases,
    props.pinnedPhrases,
  ]);

  const [renderLimit, setRenderLimit] = useState(RENDER_CONSTANT);

  useEffect(() => {
    setRenderLimit(RENDER_CONSTANT);
  }, [props.searchText]);

  useEffect(() => {
    if (isDisplayingPhrases) {
      if (isReOrderPhrasesMode) {
        setRenderLimit(RENDER_CONSTANT);
        return;
      }
      if (renderLimit < phrasesToRender.length) {
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
  }, [isDisplayingPhrases, phrasesToRender, renderLimit, isReOrderPhrasesMode]);

  const renderLimitedPhrases = useMemo(() => {
    if (isReOrderPhrasesMode) {
      return phrasesToRender;
    }
    return phrasesToRender.slice(0, renderLimit);
  }, [phrasesToRender, renderLimit, isReOrderPhrasesMode]);

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

  const onToggleFilterUntranslated = useCallback(() => {
    setFilterUntranslatedForGroup(!filterUntranslatedForGroup);
  }, [filterUntranslatedForGroup]);

  const onToggleFilterRequiresUpdate = useCallback(() => {
    setFilterRequiresUpdate(!filterRequiresUpdate);
  }, [filterRequiresUpdate]);

  useEffect(() => {
    if (isSearching && hasSearchMatches) {
      setIsExpanded(true);
    }
  }, [isSearching, hasSearchMatches]);

  useEffect(() => {
    if (isReOrderPhrasesMode && commandMode != "edit") {
      setIsReOrderPhrasesMode(false)
    }

  }, [isReOrderPhrasesMode, commandMode])

  useEffect(() => {
    if (props.searchText == "" && !props.showOnlyPinnedPhrases && isExpanded) {
      setIsExpanded(false);
    }
  }, [props.searchText])

  useEffect(() => {
    if (props.searchText == "" && props.showOnlyPinnedPhrases && !isExpanded && phrasesToRender.length > 0) {
      setIsExpanded(true);
    }
  }, [props.searchText, phrasesToRender.length])

  if (
    commandMode == "compare"
  ) {
    if (!hasAnyRemovals && compareFrom == "before") {
      return null;
    }
    if (!hasAnyAdditions && compareFrom == "after") {
      return null;
    }
  }
  if (isSearching && phrasesToRender.length == 0) {
    return null;
  }
  if (!!props.filterTag && phrasesToRender.length == 0) {
    return null;
  }
  if (props.showOnlyPinnedPhrases && phrasesToRender.length == 0) {
    return null;
  }

  if ((props.globalFilterRequiresUpdate) && phrasesToRender.length == 0) {
    return null;
  }

  if ((props.globalFilterUntranslated) && phrasesToRender.length == 0) {
    return null;
  }

  const container = (
    <Container>
      <AddPhraseModal
        show={showAddPhraseKey && commandMode == "edit"}
        onDismiss={onHideAddPhraseKey}
        onAdd={onAddPhraseKey}
        phraseGroup={props.phraseGroup}
      />
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
          {!isSearching &&
            !(props.showOnlyPinnedPhrases && props.pinnedPhrases) &&
            !props.isEditingGroups &&
            (phrases?.length ?? 0) > 0 && <>
            <ChevronWrapper onClick={onToggle}>
              <ChevronIcon
                src={chevronIcon}
                style={{
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            </ChevronWrapper>
            </>}
        </FolderRow>
        {!props.isEditingGroups && (
            <AddRow>
              {commandMode == "edit" && !isReOrderPhrasesMode && (
                <div style={{ width: 180 }}>
                  <Button
                    onClick={onShowAddPhraseKey}
                    label={"+ add phrase"}
                    bg={"teal"}
                    size={"medium"}
                  />
                </div>
              )}
            </AddRow>
          )}
      </TopRow>
      <Row
        style={{
          alignItems: commandMode == "edit" ? "flex-start" : "flex-end",
          width: "100%",
          marginTop: 24,
        }}
      >
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
        <div></div>
        {(phrases?.length ?? 0) > 0 &&
          !isReOrderPhrasesMode &&
          isExpanded &&
          !props.isEditingGroups && (
            <div
              style={{
                marginTop: 0,
                width: commandMode == "edit" ? "auto" : "100%",
              }}
            >
              <Row
                style={{
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <FilterUntranslated style={{
                  color: !filterUntranslatedForGroup ? theme.colors.contrastTextLight : theme.colors.warningTextColor
                }}>
                  {`Filter un-translated (${props.selectedTopLevelLocale}) phrases`}
                </FilterUntranslated>
                <Checkbox
                  isChecked={filterUntranslatedForGroup}
                  onChange={onToggleFilterUntranslated}
                />
              </Row>
              <Row
                style={{
                  marginTop: 24,
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <FilterUntranslated style={{
                  color: !filterRequiresUpdate ? theme.colors.contrastTextLight : theme.colors.warningTextColor
                }}>
                  {`Filter (${props.selectedTopLevelLocale}) phrases to update`}
                </FilterUntranslated>
                <Checkbox
                  isChecked={filterRequiresUpdate}
                  onChange={onToggleFilterRequiresUpdate}
                />
              </Row>
            </div>
          )}
      </Row>
      {isExpanded && (
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
                  globalFilterUntranslated={filterUntranslatedForGroup}
                  pinnedPhrases={props.pinnedPhrases}
                  setPinnedPhrases={props.setPinnedPhrases}
                  phraseRef={phraseRef}
                  selectedTopLevelLocale={props.selectedTopLevelLocale}
                  key={phraseRef}
                  index={index}
                  phrase={phrase}
                  onRemove={onRemovePhrase}
                  phraseGroup={props.phraseGroup}
                />
              );
            })}
          {isReOrderPhrasesMode && (
            <AnimatePresence>
              <Reorder.Group
                axis="y"
                values={phrases ?? []}
                onReorder={onReOrderPhrases}
                style={{listStyle: "none", margin: 0, padding: 0 }}
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
        </>
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
      style={{ position: "relative", listStyle: 'none' }}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
    >
      {container}
    </Reorder.Item>
  );
};

export default React.memo(PhraseGroup);
