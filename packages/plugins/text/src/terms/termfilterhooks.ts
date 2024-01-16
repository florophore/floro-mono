import { PointerTypes, SchemaRoot, SchemaTypes } from "../floro-schema-api";

export const filterPinnedTermsFromTerms = (
  terms: SchemaTypes["$(text).terms"],
  pinnedTerms: Array<string> | null,
  showOnlyPinnedTerms: boolean
) => {
  if (!showOnlyPinnedTerms) {
    return terms;
  }
  return terms.filter((term) => {
    const termRef = `$(text).terms.id<${term.id}>`;
    if (pinnedTerms?.includes(termRef)) {
      return true;
    }
    return false;
  });
};

export const filterUntranslatedTerms = (
  terms: SchemaTypes["$(text).terms"],
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
  filterUntranslatedForTerm: boolean
) => {
  if (!filterUntranslatedForTerm) {
    return terms;
  }
  return terms.filter((term) => {
    return getTermIsUntranslated(term, localeRef);
  });
};

export const filterTermsOnSearch = (
  terms: SchemaTypes["$(text).terms"],
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
  searchText: string
) => {
  if (searchText?.trim() == "") {
    return terms;
  }
  return terms.filter((term) => {
    return getTermIsSearchMatch(term, localeRef, searchText);
  });
};

export const getTermIsUntranslated = (
  term: SchemaTypes["$(text).terms.id<?>"],
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"]
) => {
  for (let localeTerm of term.localizedTerms ?? []) {
    if (localeTerm.id != localeRef) {
      continue;
    }
    if ((localeTerm.termValue ?? "").trim() == "") {
      return true;
    }
  }
  return false;
};

export const getTermIsSearchMatch = (
  term: SchemaTypes["$(text).terms.id<?>"],
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
  searchTermText: string
) => {
  const search = searchTermText.toLowerCase().trim?.() ?? "";
  if (search == "") {
    return true;
  }
  if ((term?.name ?? "")?.toLowerCase().indexOf(search) != -1) {
    return true;
  }
  for (let localizedTerm of term?.localizedTerms ?? []) {
    if (localizedTerm.id != localeRef) {
      continue;
    }
    if ((localizedTerm.termValue ?? "")?.toLowerCase().indexOf(search) != -1) {
      return true;
    }
    if ((localizedTerm.localNotes ?? "")?.toLowerCase().indexOf(search) != -1) {
      return true;
    }
  }
  return false;
};


export const getFilteredTerms = (
  terms: SchemaTypes["$(text).terms"],
  localeRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
  pinnedTerms: Array<string> | null,
  showOnlyPinnedTerms: boolean,
  filterUntranslatedForTerm: boolean,
  searchTermText: string
) => {
  const filteredPinnedTerms = filterPinnedTermsFromTerms(
    terms,
    pinnedTerms,
    showOnlyPinnedTerms
  );
  const untranslatedTerms = filterUntranslatedTerms(
    filteredPinnedTerms,
    localeRef,
    filterUntranslatedForTerm
  );
  return filterTermsOnSearch(untranslatedTerms, localeRef, searchTermText);
};