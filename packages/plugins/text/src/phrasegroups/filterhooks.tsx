import { application } from "express";
import {
  PointerTypes,
  SchemaRoot,
  SchemaTypes,
  getReferencedObject,
  makeQueryRef,
} from "../floro-schema-api";

export const getGlobalDefaultLocale = (
  applicationState: SchemaRoot
): SchemaTypes["$(text).localeSettings.locales.localeCode<?>"] | null => {
  if (!applicationState) {
    return null;
  }
  const localeSettings = getReferencedObject(
    applicationState,
    "$(text).localeSettings"
  );
  return (
    localeSettings.locales.find(
      (l) =>
        makeQueryRef(
          "$(text).localeSettings.locales.localeCode<?>",
          l.localeCode
        ) == localeSettings.defaultLocaleRef
    ) ?? null
  );
};

export const getTranslateFromLocale = (
  applicationState: SchemaRoot,
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"]
): SchemaTypes["$(text).localeSettings.locales.localeCode<?>"] | null => {
  if (!applicationState) {
    return null;
  }
  const locale = getReferencedObject(applicationState, localeRef);
  const defaultLocale = getGlobalDefaultLocale(applicationState);
  return locale.defaultTranslateFromLocaleRef
    ? getReferencedObject(
        applicationState,
        locale.defaultTranslateFromLocaleRef
      )
    : defaultLocale;
};

export const getShouldSkipUpdates = (
  applicationState: SchemaRoot,
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"]
): boolean => {
  if (!applicationState) {
    return false;
  }
  const locale = getReferencedObject(applicationState, localeRef);
  const translateFromLocale = getTranslateFromLocale(
    applicationState,
    localeRef
  );
  const translateFromLocaleRef = makeQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    translateFromLocale?.localeCode as string
  );
  return (
    localeRef == locale.defaultTranslateFromLocaleRef &&
    (!locale.defaultTranslateFromLocaleRef ||
      locale.defaultFallbackLocaleRef == translateFromLocaleRef)
  );
};

export const filterPinnedPhrasesFromPhraseGroup = (
  phraseGroupRef: PointerTypes["$(text).phraseGroups.id<?>"],
  phrases: SchemaTypes["$(text).phraseGroups.id<?>.phrases"],
  pinnedPhrases: Array<string>|null,
  showOnlyPinnedPhrases: boolean
) => {
  if (!showOnlyPinnedPhrases) {
    return phrases;
  }
  return phrases.filter((phrase) => {
    const phraseRef = `${phraseGroupRef}.phrases.id<${phrase.id}>`;
    if (pinnedPhrases?.includes(phraseRef)) {
      return true;
    }
    return false;
  });
};

export const filterPhrasesOnTag = (
  phrases: SchemaTypes["$(text).phraseGroups.id<?>.phrases"],
  filterTag: string | null
) => {
  if (!filterTag) {
    return phrases;
  }
  return phrases.filter((phrase) => {
    if (filterTag) {
      return phrase.tags.includes(filterTag);
    }
    return true;
  });
};

export const filterUntranslatedPhrases = (
  applicationState: SchemaRoot,
  phrases: SchemaTypes["$(text).phraseGroups.id<?>.phrases"],
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
  filterUntranslatedForGroup: boolean
) => {
  if (!filterUntranslatedForGroup) {
    return phrases;
  }
  const translateFromDisplayValue = getTranslateFromLocale(
    applicationState,
    localeRef
  );
  const translateFromRef = makeQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    translateFromDisplayValue?.localeCode as string
  );
  return phrases.filter((phrase) => {
    return getPhraseIsUntranslated(phrase, localeRef, translateFromRef)
  }
  );
};

export const getPhraseIsUntranslated = (
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"],
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
  translateFromLocaleRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"]
) => {
  if (!phrase.usePhraseSections) {
    for (let localeGroup of phrase.phraseTranslations ?? []) {
      if (localeGroup.id != localeRef) {
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
        if (translation.id != localeRef) {
          continue;
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
      if (translation.id != localeRef) {
        continue;
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
      if (translation.id != localeRef) {
        continue;
      }
      if ((translation.linkDisplayValue.plainText ?? "").trim() == "") {
        return true;
      }
      if ((translation.linkHrefValue.plainText ?? "").trim() == "") {
        const translateFromHrefValue = linkVariable?.translations?.find(
            (l) => l.id == translateFromLocaleRef
        );
        if (localeRef != translateFromLocaleRef &&
            (translation?.linkHrefValue?.sourceAtRevision?.json ?? "{}") !=
            (translateFromHrefValue?.linkHrefValue?.json ?? "{}")
        ) {
            return true;
        }
        return true;
      }
    }
  }
  for (let variant of phrase?.interpolationVariants ?? []) {
    for (let translation of variant?.localeRules ?? []) {
      if (translation.id != localeRef) {
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
};

export const filterPhrasesToUpdate = (
  applicationState: SchemaRoot,
  phrases: SchemaTypes["$(text).phraseGroups.id<?>.phrases"],
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
  filterRequiresUpdate: boolean
) => {
  const locale = getReferencedObject(applicationState, localeRef);
  const shouldSkipUpdate = getShouldSkipUpdates(applicationState, localeRef);
  const translateFromDisplayValue = getTranslateFromLocale(
    applicationState,
    localeRef
  );
  if (!translateFromDisplayValue) {
    return phrases;
  }
  const translateFromRef = makeQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    translateFromDisplayValue?.localeCode as string
  );
  const defaultLocale = getGlobalDefaultLocale(applicationState);
  if (!filterRequiresUpdate) {
    return phrases;
  }
  if (shouldSkipUpdate) {
    return phrases;
  }
  if (defaultLocale?.localeCode == locale?.localeCode) {
    return [];
  }
  return phrases.filter((phrase) =>
    getPhraseTranslationRequiresUpdate(phrase, localeRef, translateFromRef)
  );
};

export const getPhraseTranslationRequiresUpdate = (
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"],
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
  translateFromLocaleRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"]
) => {
  if (phrase.usePhraseSections) {
    for (let phraseSection of phrase?.phraseSections ?? []) {
      if ((phraseSection.name ?? "").trim() == "") {
        return true;
      }
      for (let translation of phraseSection.localeRules ?? []) {
        if (translation.id != localeRef) {
          continue;
        }
        const translateFromDisplayValue = phraseSection.localeRules.find(
          (l) => l.id == translateFromLocaleRef
        );
        if (
          (translation?.displayValue?.sourceAtRevision?.json ?? "{}") !=
          (translateFromDisplayValue?.displayValue?.json ?? "{}")
        ) {
          if (localeRef == translateFromLocaleRef) {
            return true;
          }
          if (translateFromDisplayValue?.displayValue?.plainText != "") {
            return true;
          }
        }
      }
    }
  } else {
    for (let localeGroup of phrase.phraseTranslations ?? []) {
      if (localeGroup.id != localeRef) {
        continue;
      }
      const translateFrom = phrase.phraseTranslations.find(
        (l) => l.id == translateFromLocaleRef
      );
      if (
        (localeGroup?.sourceAtRevision?.json ?? "{}") !=
        (translateFrom?.json ?? "{}")
      ) {
        if (localeRef == translateFromLocaleRef) {
          return true;
        }
        if (translateFrom?.plainText != "") {
          return true;
        }
      }
    }
  }

  for (let linkVariable of phrase?.linkVariables ?? []) {
    if ((linkVariable.linkName ?? "").trim() == "") {
      return true;
    }
    for (let translation of linkVariable.translations ?? []) {
      if (translation.id != localeRef) {
        continue;
      }
      const translateFromDisplayValue = linkVariable.translations.find(
        (l) => l.id == translateFromLocaleRef
      );
      if (
        (translation?.linkDisplayValue?.sourceAtRevision?.json ?? "{}") !=
        (translateFromDisplayValue?.linkDisplayValue?.json ?? "{}")
      ) {
        if (localeRef == translateFromLocaleRef) {
          return true;
        }
        if (translateFromDisplayValue?.linkDisplayValue?.plainText != "") {
          return true;
        }
      }
      const translateFromHrefValue = linkVariable.translations.find(
        (l) => l.id == translateFromLocaleRef
      );
      if (
        (translation?.linkHrefValue?.sourceAtRevision?.json ?? "{}") !=
        (translateFromHrefValue?.linkHrefValue?.json ?? "{}")
      ) {
        return true;
      }
    }
  }
  for (let variant of phrase?.interpolationVariants ?? []) {
    for (let translation of variant?.localeRules ?? []) {
      if (translation.id != localeRef) {
        continue;
      }
      const translateFrom = variant?.localeRules.find(
        (l) => l.id == translateFromLocaleRef
      );
      if (
        (translation?.defaultValue?.sourceAtRevision?.json ?? "{}") !=
        (translateFrom?.defaultValue?.json ?? "{}")
      ) {
        if (localeRef == translateFromLocaleRef) {
          return true;
        }
        if (translateFrom?.defaultValue?.plainText != "") {
          return true;
        }
      }
    }
  }
  for (let styledContent of phrase?.styledContents ?? []) {
    for (let translation of styledContent?.localeRules ?? []) {
      if (translation.id != localeRef) {
        continue;
      }
      const translateFrom = styledContent?.localeRules.find(
        (l) => l.id == translateFromLocaleRef
      );
      if (
        (translation?.displayValue?.sourceAtRevision?.json ?? "{}") !=
        (translateFrom?.displayValue?.json ?? "{}")
      ) {
        if (localeRef == translateFromLocaleRef) {
          return true;
        }
        if (translateFrom?.displayValue?.plainText != "") {
          return true;
        }
      }
    }
  }
  return false;
};

export const filterPhrasesOnSearch = (
  phrases: SchemaTypes["$(text).phraseGroups.id<?>.phrases"],
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
  searchText: string
) => {
  const isSearching = searchText.trim() != "";
  if (!isSearching) {
    return phrases;
  }
  return phrases.filter((phrase) =>
    getPhraseMatchesSearch(phrase, localeRef, searchText)
  );
};

export const getPhraseMatchesSearch = (
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"],
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
  searchText: string,
  opts : {
    skipPhraseKey?: boolean,
    skipTitles?: boolean,
    skipVars?: boolean,
    skipDescription?: boolean,
  } = {
    skipPhraseKey: false,
    skipDescription: false,
    skipTitles: false,
    skipVars: false
  }
) => {
  const search = searchText.toLowerCase().trim();
  if (!opts.skipPhraseKey) {
    if (
        (phrase?.phraseKey ?? "")
        ?.toLowerCase()
        .indexOf(search) != -1 ||
        (phrase?.phraseKey ?? "")
        ?.toLowerCase()
        .indexOf(search) != -1
    ) {
        return true;
    }
  }
  if (!opts.skipDescription) {
    if (
        (phrase?.description?.value ?? "")
        ?.toLowerCase()
        .indexOf(search) != -1 ||
        (phrase?.description?.value ?? "")
        ?.toLowerCase()
        .indexOf(search) != -1
    ) {
        return true;
    }
  }
  if (phrase.usePhraseSections) {
    for (let phraseSection of phrase?.phraseSections ?? []) {
        if (!opts.skipTitles) {
          if (
            (phraseSection.name ?? "")
              ?.toLowerCase()
              .indexOf(search) != -1
          ) {
            return true;
          }
        }
        for (let translation of phraseSection.localeRules ?? []) {
          if (translation.id != localeRef) {
            continue;
          }
          if (
            (translation.displayValue.plainText ?? "")
              ?.toLowerCase()
              .indexOf(search) != -1
          ) {
            return true;
          }
        }
    }
  } else {
    for (let localeGroup of phrase.phraseTranslations ?? []) {
      if (localeGroup.id != localeRef) {
        continue;
      }
      if (
        (localeGroup.plainText ?? "")
          ?.toLowerCase()
          .indexOf(search) != -1
      ) {
        return true;
      }
    }
  }
  if (!opts.skipVars) {
    for (let variable of phrase?.variables ?? []) {
        if (
        (variable.name ?? "")
            ?.toLowerCase()
            .indexOf(search) != -1
        ) {
        return true;
        }
    }
    for (let contentVariable of phrase?.contentVariables ?? []) {
        if (
        (contentVariable.name ?? "")
            ?.toLowerCase()
            .indexOf(search) != -1
        ) {
        return true;
        }
    }
    for (let styleClass of phrase?.styleClasses ?? []) {
        if (
        (styleClass.name ?? "")
            ?.toLowerCase()
            .indexOf(search) != -1
        ) {
        return true;
        }
    }
  }

  for (let styledContent of phrase?.styledContents ?? []) {
    if (!opts.skipTitles) {
      if (
        (styledContent.name ?? "")
          ?.toLowerCase()
          .indexOf(search) != -1
      ) {
        return true;
      }
    }
    for (let translation of styledContent.localeRules ?? []) {
      if (translation.id != localeRef) {
        continue;
      }
      if (
        (translation.displayValue.plainText ?? "")
          ?.toLowerCase()
          .indexOf(search) != -1
      ) {
        return true;
      }
    }
  }
  for (let linkVariable of phrase?.linkVariables ?? []) {
    if (!opts.skipTitles) {
        if (
        (linkVariable.linkName ?? "")
            ?.toLowerCase()
            .indexOf(search) != -1
        ) {
        return true;
        }
    }
    for (let translation of linkVariable.translations ?? []) {
      if (translation.id != localeRef) {
        continue;
      }
      if (
        (translation.linkDisplayValue.plainText ?? "")
          ?.toLowerCase()
          .indexOf(search) != -1
      ) {
        return true;
      }
      if (
        (translation.linkHrefValue.plainText ?? "")
          ?.toLowerCase()
          .indexOf(search) != -1
      ) {
        return true;
      }
    }
  }
  for (let variant of phrase?.interpolationVariants ?? []) {
    if (!opts.skipTitles) {
        if (
        (variant.name ?? "")
            ?.toLowerCase()
            .indexOf(searchText.toLowerCase().trim()) != -1
        ) {
        return true;
        }
    }
    for (let translation of variant?.localeRules ?? []) {
      if (translation.id != localeRef) {
        continue;
      }
      if (
        (translation.defaultValue?.plainText ?? "")
          ?.toLowerCase()
          .indexOf(search) != -1
      ) {
        return true;
      }

      for (let conditional of translation.conditionals ?? []) {
        if (
          (conditional?.resultant?.plainText ?? "")
            ?.toLowerCase()
            .indexOf(search) != -1
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

export const getPhrasesFilteredForPhraseGroup = (
  applicationState: SchemaRoot,
  phraseGroupRef: PointerTypes["$(text).phraseGroups.id<?>"],
  phrases: SchemaTypes["$(text).phraseGroups.id<?>.phrases"],
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
  pinnedPhrases: Array<string>|null,
  showOnlyPinnedPhrases: boolean,
  filterTag: string | null,
  filterRequiresUpdate: boolean,
  filterUntranslatedForGroup: boolean,
  searchText: string
): SchemaTypes["$(text).phraseGroups.id<?>.phrases"] => {
    const phrasesFilteredByPins = filterPinnedPhrasesFromPhraseGroup(
        phraseGroupRef,
        phrases,
        pinnedPhrases,
        showOnlyPinnedPhrases
    );
    const phrasesFilteredOnTag = filterPhrasesOnTag(phrasesFilteredByPins, filterTag);
    const phrasesFilteredOnUnTranslated = filterUntranslatedPhrases(
      applicationState,
      phrasesFilteredOnTag,
      localeRef,
      filterUntranslatedForGroup
    );
    const phrasesToUpdate = filterPhrasesToUpdate(
      applicationState,
      phrasesFilteredOnUnTranslated,
      localeRef,
      filterRequiresUpdate
    );

    return filterPhrasesOnSearch(phrasesToUpdate, localeRef, searchText)
}


export const getPhrasesGroupHasMatches = (
  applicationState: SchemaRoot,
  phraseGroupRef: PointerTypes["$(text).phraseGroups.id<?>"],
  phrases: SchemaTypes["$(text).phraseGroups.id<?>.phrases"],
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
  pinnedPhrases: Array<string>|null,
  showOnlyPinnedPhrases: boolean,
  filterTag: string | null,
  filterRequiresUpdate: boolean,
  filterUntranslatedForGroup: boolean,
  searchText: string
): boolean => {
    if (
      !showOnlyPinnedPhrases &&
      !filterRequiresUpdate &&
      !filterUntranslatedForGroup &&
      !filterTag &&
      searchText?.trim() == ""
    ) {
      return true;
    }
    const filteredPhrases = getPhrasesFilteredForPhraseGroup(
        applicationState,
        phraseGroupRef,
        phrases,
        localeRef,
        pinnedPhrases,
        showOnlyPinnedPhrases,
        filterTag,
        filterRequiresUpdate,
        filterUntranslatedForGroup,
        searchText
    );
  return filteredPhrases.length > 0;
}


export const getFilteredPhrasesGroups = (
  applicationState: SchemaRoot,
  phraseGroups: SchemaTypes["$(text).phraseGroups"],
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
  pinnedPhrases: Array<string> | null,
  showOnlyPinnedPhrases: boolean,
  filterTag: string | null,
  filterRequiresUpdate: boolean,
  filterUntranslatedForGroup: boolean,
  searchText: string
): SchemaTypes["$(text).phraseGroups"] => {
  return phraseGroups.filter((phraseGroup) => {
    const phraseGroupRef = makeQueryRef(
      "$(text).phraseGroups.id<?>",
      phraseGroup.id
    );
    return getPhrasesGroupHasMatches(
      applicationState,
      phraseGroupRef,
      phraseGroup.phrases,
      localeRef,
      pinnedPhrases,
      showOnlyPinnedPhrases,
      filterTag,
      filterRequiresUpdate,
      filterUntranslatedForGroup,
      searchText
    );
  });
};


export const filterPinnedPhraseGroups = (
  phraseGroups: SchemaTypes["$(text).phraseGroups"],
  pinnedPhraseGroups: Array<string>|null,
  showOnlyPinnedGroups: boolean
) => {
  if (!showOnlyPinnedGroups) {
    return phraseGroups;
  }
  return phraseGroups?.filter?.((phraseGroup) => {
    const phraseGroupRef = makeQueryRef("$(text).phraseGroups.id<?>", phraseGroup.id);
    if (pinnedPhraseGroups?.includes(phraseGroupRef)) {
      return true;
    }
    return false;
  }) ?? [];
};