import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useTheme } from "@emotion/react";
import { ThemeProvider } from "@emotion/react";
import styled from "@emotion/styled";
import ColorPalette from "@floro/styles/ColorPalette";
import { PointerTypes, SchemaTypes, extractQueryArgs, getReferencedObject, makeQueryRef, useFloroContext } from "../floro-schema-api";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import Button from "@floro/storybook/stories/design-system/Button";
import XCircleLight from '@floro/common-assets/assets/images/icons/x_circle.light.svg';
import XCircleDark from '@floro/common-assets/assets/images/icons/x_circle.dark.svg';
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";

import FilterLight from "@floro/common-assets/assets/images/icons/filter.light.svg";
import FilterDark from "@floro/common-assets/assets/images/icons/filter.dark.svg";
import FilterSelected from "@floro/common-assets/assets/images/icons/filter.selected.svg";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

import ChevronLight from "@floro/common-assets/assets/images/icons/chevron.light.svg";
import ChevronDark from "@floro/common-assets/assets/images/icons/chevron.dark.svg";
import PhraseGroup from "../phrasegroups/PhraseGroup";

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 56px);
  padding-top: 24px;
  padding-right: 48px;
`;

const BottomRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 56px;
  padding-top: 12px;
  padding-right: 48px;
  padding-left: 24px;
`;

const AddRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-end;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const FilterIcon = styled.img`
  height: 32px;
  width: 32px;
  margin-left: 24px;
  cursor: pointer;
`;

const FilterUntranslated = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastTextLight};
  font-weight: 500;
  font-size: 1.4rem;
  padding: 0;
  margin-left: 12px;
  text-decoration: underline;
  cursor: pointer;
`;

const ChevronWrapper = styled.div`
  height: 28px;
  width: 28px;
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

const ChangeDot = styled.div`
  position: absolute;
  right: -12px;
  top: -4px;
  height: 16px;
  width: 16px;
  background: ${props => props.theme.colors.warningTextColor};
  border-radius: 50%;
`;

interface Props {
  showFilters: boolean;
  setShowFilters: (b: boolean) => void;
  onSetSearchText: (str: string) => void;
  searchText: string;
  searchTextState: string;
  pinnedPhrases: Array<string>|null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  setShowOnlyPinnedPhrases: (filter: boolean) => void;
  removePinnedPhrases: () => void;
  onSetSearchTextState: (str: string) => void;
  setGlobalFilterRequiresUpdate: (filter: boolean) => void;
  setGlobalFilterUnstranslated: (filter: boolean) => void;
  showOnlyPinnedPhrases: boolean;
  selectedTopLevelLocale: string;
  globalFilterUntranslated: boolean;
  globalFilterRequiresUpdate: boolean;
  filterTag: string | null;
  isEditGroups: boolean;
  onShowEditGroups: () => void;
  onHideEditGroups: () => void;
  phraseGroups: SchemaTypes['$(text).phraseGroups']
  filteredPhraseGroups: SchemaTypes["$(text).phraseGroups"];
  pinnedPhrasesWithGroups: {
    phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
    phraseGroup: SchemaTypes["$(text).phraseGroups.id<?>"];
  }[];
  selectedGroup: string | null;
  setSelectedGroup: (tag: string | null) => void;

  pinnedGroups: Array<string>|null;
  setPinnedGroups: (groupRefs: Array<string>) => void;
  showOnlyPinnedGroups: boolean;
  setShowOnlyPinnedGroups: (filter: boolean) => void;
}

const PhraseHeader = (props: Props) => {
  const theme = useTheme();

  const { commandMode, applicationState, clientStorage } = useFloroContext();
  const clientStorageIsEnabled = clientStorage != null;
  const isSearching = useMemo(
    () => props.searchText.trim() != "",
    [props.searchText]
  );

  const pinnedPhraseGroups = useMemo(() => {
    return props.phraseGroups.filter(phraseGroup => {
      const phraseGroupRef = makeQueryRef("$(text).phraseGroups.id<?>", phraseGroup.id);
      return props.pinnedGroups?.includes(phraseGroupRef);
    })
  }, [props.phraseGroups, props.pinnedGroups]);

  const filterIcon = useMemo(() => {
    if (props.showFilters) {
      return FilterSelected;
    }
    if (theme.name == "light") {
      return FilterLight;
    }
    return FilterDark;
  }, [theme.name, props.showFilters])

  const searchBorderColor = useMemo(() => {
    if (theme.name == "light") {
      return ColorPalette.gray;
    }
    return ColorPalette.gray;
  }, [theme.name]);

  const clearIcon = useMemo(() => {
      if (theme.name == 'light') {
        return XCircleLight;
      }
      return XCircleDark;
  }, [theme.name])
  const onClearPinnedPhrases = useCallback(() => {
    props.removePinnedPhrases?.();
  }, [props.removePinnedPhrases, props.setShowOnlyPinnedPhrases]);

  //useEffect(() => {
  //  if (props.showOnlyPinnedPhrases) {
  //    props.setGlobalFilterRequiresUpdate(false);
  //    props.setGlobalFilterUnstranslated(false);
  //    props.onSetSearchText("");
  //    props.onSetSearchTextState("");
  //  }
  //}, [props.showOnlyPinnedPhrases])

  //const [searchText, setSearchText] = useState(props.searchText ?? "");

  const phraseGroupOptions = useMemo(() => {
    return props.filteredPhraseGroups.map(phraseGroup => {

      const phraseGroupRef = makeQueryRef(
        "$(text).phraseGroups.id<?>",
        phraseGroup?.id as string,
      );
      return {
        label: phraseGroup.name,
        value: phraseGroupRef,
      }
    })

  }, [props.filteredPhraseGroups])

  const onToggleFilters = useCallback(() => {
    props.setShowFilters(!props.showFilters);
  }, [props.showFilters])

  const chevronIcon = useMemo(() => {
    if (theme.name == "light") {
      return ChevronLight;
    }
    return ChevronDark;
  }, [theme.name]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      props.onSetSearchText(props.searchTextState);
    }, 300);
    return () => {
      clearTimeout(timeout);
    }
  }, [props.searchTextState, props.selectedTopLevelLocale, props.onSetSearchText])

  useEffect(() => {
    if (
      props.pinnedPhrasesWithGroups?.length == 0 &&
      props.showOnlyPinnedPhrases
    ) {
      props.setShowOnlyPinnedPhrases(false);
    }
  }, [
    props.pinnedPhrasesWithGroups?.length,
    props.showOnlyPinnedPhrases,
    props.setShowOnlyPinnedPhrases,
  ]);

  useEffect(() => {
    if (pinnedPhraseGroups?.length == 0 && props.showOnlyPinnedGroups) {
      props.setShowOnlyPinnedGroups(false);
    }
  }, [
    pinnedPhraseGroups?.length,
    props.showOnlyPinnedGroups,
    props.setShowOnlyPinnedGroups,
  ]);

  const hasFiltersOn = useMemo(() => {
    return (
      !!props.filterTag ||
      props.globalFilterUntranslated ||
      props.globalFilterRequiresUpdate
    );
  }, [props.filterTag, props.globalFilterRequiresUpdate, props.globalFilterUntranslated])

  useEffect(() => {
    if (hasFiltersOn && props.isEditGroups) {
      props.onHideEditGroups();
    }
  }, [props.onHideEditGroups, hasFiltersOn, props.isEditGroups])

  return (
    <Container>
      <TopRow>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            height: 40,
          }}
        >
          <div style={{ marginLeft: 24 }}>
            <SearchInput
              showClear
              width={480}
              height={60}
              value={props.searchTextState}
              placeholder={"search phrases"}
              onTextChanged={props.onSetSearchTextState}
              borderColor={searchBorderColor}
              disabled={props.isEditGroups}
            />
          </div>
          <div style={{ position: "relative" }}>
            <FilterIcon onClick={onToggleFilters} src={filterIcon} />
            {hasFiltersOn && <ChangeDot />}
          </div>
        </div>
        <AddRow>
          {
            <>
              {!props.isEditGroups && (
                <div style={{ marginTop: -24 }}>
                  <div style={{ display: "flex" }}>
                    <InputSelector
                      value={props.selectedGroup}
                      size={"mid"}
                      options={phraseGroupOptions}
                      label={"phrase group"}
                      placeholder={"select phrase key"}
                      onChange={(option) => {
                        props.setSelectedGroup(
                          (option?.value as PointerTypes["$(text).phraseGroups.id<?>"]) ??
                            null
                        );
                      }}
                    />
                  </div>
                </div>
              )}
              {commandMode == "edit" && (
                <div style={{ width: 180, marginLeft: 24 }}>
                  <Button label={"+ add group"} bg={"orange"} size={"medium"} />
                </div>
              )}
            </>
          }
        </AddRow>
      </TopRow>
      <BottomRow>
        <Row>
          {(pinnedPhraseGroups?.length ?? 0) > 0 &&
            !props.isEditGroups && (
              <Row style={{ width: 400 }}>
                <Checkbox
                  isChecked={props.showOnlyPinnedGroups}
                  onChange={props.setShowOnlyPinnedGroups}
                />
                <FilterUntranslated
                  style={{
                    marginLeft: 12,
                    fontWeight: 600,
                    color: props.showOnlyPinnedGroups
                      ? theme.colors.warningTextColor
                      : theme.colors.contrastText,
                  }}
                >
                  {(pinnedPhraseGroups.length ?? 0) == 0
                    ? `Show Only Pinned Groups`
                    : `Show Only Pinned Groups (${pinnedPhraseGroups.length})`}
                </FilterUntranslated>
                <ChevronWrapper>
                  <ChevronIcon src={chevronIcon} />
                </ChevronWrapper>
              </Row>
            )}
          {(props.pinnedPhrasesWithGroups?.length ?? 0) > 0 &&
            !props.isEditGroups && (
              <Row style={{ width: 400 }}>
                <Checkbox
                  isChecked={props.showOnlyPinnedPhrases}
                  onChange={props.setShowOnlyPinnedPhrases}
                />
                <FilterUntranslated
                  style={{
                    marginLeft: 12,
                    fontWeight: 600,
                    color: props.showOnlyPinnedPhrases
                      ? theme.colors.warningTextColor
                      : theme.colors.contrastText,
                  }}
                >
                  {(props.pinnedPhrasesWithGroups.length ?? 0) == 0
                    ? `Show Only Pinned Phrases`
                    : `Show Only Pinned Phrases (${props.pinnedPhrasesWithGroups.length})`}
                </FilterUntranslated>
                <ChevronWrapper>
                  <ChevronIcon src={chevronIcon} />
                </ChevronWrapper>
              </Row>
            )}
        </Row>
        {commandMode == "edit" &&
          !hasFiltersOn &&
          props.phraseGroups.length > 0 &&
          !props.showOnlyPinnedPhrases && (
            <SubTitleRow>
              {!props.isEditGroups && (
                <SubTitle
                  onClick={props.onShowEditGroups}
                >{`organize groups`}</SubTitle>
              )}
              {props.isEditGroups && (
                <SubTitle
                  onClick={props.onHideEditGroups}
                >{`done organizing groups`}</SubTitle>
              )}
            </SubTitleRow>
          )}
      </BottomRow>
    </Container>
  );
};

export default React.memo(PhraseHeader);
