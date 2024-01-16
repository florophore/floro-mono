import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef
} from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import ColorPalette from "@floro/styles/ColorPalette";
import {
  PointerTypes,
  SchemaTypes,
  makeQueryRef,
  useFloroContext,
  useReferencedObject,
} from "../floro-schema-api";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import Button from "@floro/storybook/stories/design-system/Button";
import XCircleLight from "@floro/common-assets/assets/images/icons/x_circle.light.svg";
import XCircleDark from "@floro/common-assets/assets/images/icons/x_circle.dark.svg";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";

import FilterLight from "@floro/common-assets/assets/images/icons/filter.light.svg";
import FilterDark from "@floro/common-assets/assets/images/icons/filter.dark.svg";
import FilterSelected from "@floro/common-assets/assets/images/icons/filter.selected.svg";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

import ChevronLight from "@floro/common-assets/assets/images/icons/chevron.light.svg";
import ChevronDark from "@floro/common-assets/assets/images/icons/chevron.dark.svg";

import CrossLight from "@floro/common-assets/assets/images/icons/cross.light.svg";
import CrossDark from "@floro/common-assets/assets/images/icons/cross.dark.svg";
import AddPhraseGroupModal from "./AddPhraseGroupModal";

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

const ClearText = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.linkColor};
  font-weight: 500;
  font-size: 1.4rem;
  padding: 0;
  text-decoration: underline;
  text-align: center;
  cursor: pointer;
`;

const PinnedText = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastText};
  font-weight: 600;
  font-size: 1.4rem;
  padding: 0;
  text-align: center;
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
  background: ${(props) => props.theme.colors.warningTextColor};
  border-radius: 50%;
`;

const CrossIcon = styled.img`
  height: 24px;
  width: 24px;
  cursor: pointer;
`;

const Pinned = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastText};
  font-weight: 500;
  font-size: 1.4rem;
  padding: 0;
  text-align: center;
  word-break: break-word;
`;

interface Props {
  showFilters: boolean;
  setShowFilters: (b: boolean) => void;
  onSetSearchText: (str: string) => void;
  searchText: string;
  searchTextState: string;
  pinnedPhrases: Array<string> | null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  setShowOnlyPinnedPhrases: (filter: boolean) => void;
  removePinnedPhrases: () => void;
  removePinnedGroups: () => void;
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
  phraseGroups: SchemaTypes["$(text).phraseGroups"];
  filteredPhraseGroups: SchemaTypes["$(text).phraseGroups"];
  pinnedPhrasesWithGroups: {
    phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
    phraseGroup: SchemaTypes["$(text).phraseGroups.id<?>"];
  }[];
  selectedGroup: string | null;
  setSelectedGroup: (tag: string | null) => void;

  pinnedGroups: Array<string> | null;
  setPinnedGroups: (groupRefs: Array<string>) => void;
  showOnlyPinnedGroups: boolean;
  setShowOnlyPinnedGroups: (filter: boolean) => void;
  setPhraseGroups: (pgs: SchemaTypes['$(text).phraseGroups'], doSave?: boolean) => void|(() => void);
}

const PhraseHeader = (props: Props) => {
  const theme = useTheme();

  const { commandMode, } = useFloroContext();
  const [showPinnedGroups, setShowPinnedGroups] = useState(false);
  const [showPinnedPhrases, setShowPinnedPhrases] = useState(false);
  const [showAddGroup, setShowAddPhraseGroup] = useState(false);
  const pinnedGroupsContainer = useRef<HTMLDivElement>(null);
  const pinnedPhrasesContainer = useRef<HTMLDivElement>(null);

  const onToggleShowPinnedGroups = useCallback(() => {
    setShowPinnedGroups(!showPinnedGroups);
  }, [showPinnedGroups]);

  const onToggleShowPinnedPhrases = useCallback(() => {
    setShowPinnedPhrases(!showPinnedPhrases);
  }, [showPinnedPhrases]);

  useEffect(() => {
    const onWindowClick = (e: Event) => {
      if (!showPinnedGroups) {
        return;
      }
      if (pinnedGroupsContainer.current && !pinnedGroupsContainer.current.contains(e.target as Node)) {
          setShowPinnedGroups(false);
      }
    }
    document.addEventListener("click", onWindowClick);
    return () => {
        document.removeEventListener("click", onWindowClick);
    }
  }, [pinnedGroupsContainer.current, showPinnedGroups]);

  useEffect(() => {
    const onWindowClick = (e: Event) => {
      if (!showPinnedPhrases) {
        return;
      }
      if (pinnedPhrasesContainer.current && !pinnedPhrasesContainer.current.contains(e.target as Node)) {
          setShowPinnedPhrases(false);
      }
    }
    document.addEventListener("click", onWindowClick);
    return () => {
        document.removeEventListener("click", onWindowClick);
    }
  }, [pinnedPhrasesContainer.current, showPinnedPhrases]);

  const pinnedPhraseGroups = useMemo(() => {
    return props.phraseGroups.filter((phraseGroup) => {
      const phraseGroupRef = makeQueryRef(
        "$(text).phraseGroups.id<?>",
        phraseGroup.id
      );
      return props.pinnedGroups?.includes(phraseGroupRef);
    });
  }, [props.phraseGroups, props.pinnedGroups]);

  const localeSettings = useReferencedObject("$(text).localeSettings");
  const locale = useMemo(() => {
    return (
      localeSettings?.locales?.find?.((l) => {
        return l.localeCode == props.selectedTopLevelLocale;
      }) ??
      localeSettings?.locales?.find?.((l) => {
        return (
          localeSettings?.defaultLocaleRef ==
          makeQueryRef(
            "$(text).localeSettings.locales.localeCode<?>",
            l?.localeCode
          )
        );
      })
    );
  }, [
    props?.selectedTopLevelLocale,
    localeSettings?.locales,
    localeSettings?.defaultLocaleRef,
  ]);

  const filterIcon = useMemo(() => {
    if (props.showFilters) {
      return FilterSelected;
    }
    if (theme.name == "light") {
      return FilterLight;
    }
    return FilterDark;
  }, [theme.name, props.showFilters]);

  const searchBorderColor = useMemo(() => {
    if (theme.name == "light") {
      return ColorPalette.gray;
    }
    return ColorPalette.gray;
  }, [theme.name]);

  const clearIcon = useMemo(() => {
    if (theme.name == "light") {
      return XCircleLight;
    }
    return XCircleDark;
  }, [theme.name]);

  const crossIcon = useMemo(() => {
    if (theme.name == "light") {
      return CrossLight;
    }
    return CrossDark;
  }, [theme.name]);

  const phraseGroupOptions = useMemo(() => {
    return props.filteredPhraseGroups.map((phraseGroup) => {
      const phraseGroupRef = makeQueryRef(
        "$(text).phraseGroups.id<?>",
        phraseGroup?.id as string
      );
      return {
        label: phraseGroup.name,
        value: phraseGroupRef,
      };
    });
  }, [props.filteredPhraseGroups]);

  const onToggleFilters = useCallback(() => {
    props.setShowFilters(!props.showFilters);
  }, [props.showFilters]);

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
    };
  }, [
    props.searchTextState,
    props.selectedTopLevelLocale,
    props.onSetSearchText,
  ]);

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
  }, [
    props.filterTag,
    props.globalFilterRequiresUpdate,
    props.globalFilterUntranslated,
  ]);

  useEffect(() => {
    if (hasFiltersOn && props.isEditGroups) {
      props.onHideEditGroups();
    }
  }, [props.onHideEditGroups, hasFiltersOn, props.isEditGroups]);

  useEffect(() => {
    if ((pinnedPhraseGroups?.length ?? 0) == 0) {
      setShowPinnedGroups(false);
    }
  }, [pinnedPhraseGroups?.length ?? 0]);

  useEffect(() => {
    if ((props.pinnedPhrasesWithGroups?.length ?? 0) == 0) {
      setShowPinnedPhrases(false);
    }
  }, [props.pinnedPhrasesWithGroups?.length ?? 0]);

  const pinnedGroupIds = useMemo(() => {
    const set: Set<string> = new Set();
    for (const { phraseGroup } of props.pinnedPhrasesWithGroups ?? {}) {
      if (phraseGroup.id && !set.has(phraseGroup.id)) {
        set.add(phraseGroup.id);
      }
    }
    return set;
  }, [props.pinnedPhrasesWithGroups]);

  const formattedPinnedPhrases = useMemo(() => {
    const out: {
      phraseGroup: SchemaTypes["$(text).phraseGroups.id<?>"];
      phrases: SchemaTypes["$(text).phraseGroups.id<?>.phrases"];
    }[] = [];

    for (const phraseGroup of props.phraseGroups) {
      const set: Set<string> = new Set();
      for (const { phrase } of props.pinnedPhrasesWithGroups ?? {}) {
        if (phrase.id && !set.has(phrase.id)) {
          set.add(phrase.id);
        }
      }
      if (pinnedGroupIds.has(phraseGroup.id)) {
        const phrases = phraseGroup.phrases.filter((p) => {
          return set.has(p.id);
        });
        out.push({
          phraseGroup,
          phrases,
        });
      }
    }

    return out;
  }, [pinnedGroupIds, props.phraseGroups]);

  return (
    <Container>
      <AddPhraseGroupModal
        phraseGroups={props.phraseGroups}
        setPhraseGroups={props.setPhraseGroups}
        show={showAddGroup}
        onDismiss={() => {
          setShowAddPhraseGroup(false);
        }}
      />
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
              width={400}
              height={60}
              value={props.searchTextState}
              placeholder={`search phrases (${locale?.localeCode})`}
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
                      size={"semi-short"}
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
                  <Button
                    label={"+ add group"}
                    bg={"orange"}
                    size={"medium"}
                    isDisabled={
                      props.showOnlyPinnedGroups ||
                      props.showOnlyPinnedPhrases ||
                      hasFiltersOn
                    }
                    onClick={() => {
                      setShowAddPhraseGroup(true);
                    }}
                  />
                </div>
              )}
            </>
          }
        </AddRow>
      </TopRow>
      <BottomRow>
        <Row>
          {(pinnedPhraseGroups?.length ?? 0) > 0 && !props.isEditGroups && (
            <Row
              ref={pinnedGroupsContainer}
              style={{ width: 400, position: "relative" }}
            >
              <Checkbox
                isChecked={props.showOnlyPinnedGroups}
                onChange={props.setShowOnlyPinnedGroups}
              />
              <FilterUntranslated
                onClick={onToggleShowPinnedGroups}
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
              <ChevronWrapper onClick={onToggleShowPinnedGroups}>
                <ChevronIcon
                  src={chevronIcon}
                  style={{
                    transform: showPinnedGroups
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                  }}
                />
              </ChevronWrapper>
              {showPinnedGroups && (pinnedPhraseGroups?.length ?? 0) && (
                <div
                  style={{
                    position: "absolute",
                    top: 40,
                    left: 32,
                    width: 350,
                    height: 500,
                    borderRadius: 8,
                    background: theme.background,
                    padding: 16,
                    boxShadow: `0px 0px 6px 6px ${theme.shadows.outerDropdown}`,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 56,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: `1px solid ${ColorPalette.gray}`,
                    }}
                  >
                    <PinnedText>{"Pinned Groups"}</PinnedText>
                    <CrossIcon
                      onClick={() => {
                        setShowPinnedGroups(false);
                      }}
                      src={crossIcon}
                    />
                  </div>
                  <div
                    style={{
                      width: "100%",
                      flexGrow: 1,
                      paddingTop: 16,
                      paddingBottom: 16,
                      overflowY: "scroll",
                    }}
                  >
                    {pinnedPhraseGroups?.map((phraseGroup, index) => {
                      return (
                        <div
                          key={index}
                          style={{
                            width: "100%",
                            height: 48,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Pinned>{phraseGroup.name}</Pinned>
                          <img
                            src={clearIcon}
                            onClick={() => {
                              const next =
                                props.pinnedGroups?.filter((p) => {
                                  const ref = makeQueryRef(
                                    "$(text).phraseGroups.id<?>",
                                    phraseGroup.id
                                  );
                                  return ref != p;
                                }) ?? [];
                              props.setPinnedGroups(next);
                            }}
                            style={{
                              height: 28,
                              width: 28,
                              cursor: "pointer",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: 56,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderTop: `1px solid ${ColorPalette.gray}`,
                    }}
                  >
                    <ClearText
                      onClick={() => {
                        props.setPinnedGroups([]);
                      }}
                    >
                      {"clear all pinned groups"}
                    </ClearText>
                  </div>
                </div>
              )}
            </Row>
          )}
          {(props.pinnedPhrasesWithGroups?.length ?? 0) > 0 &&
            !props.isEditGroups && (
              <Row
                ref={pinnedPhrasesContainer}
                style={{ width: 400, position: "relative" }}
              >
                <Checkbox
                  isChecked={props.showOnlyPinnedPhrases}
                  onChange={props.setShowOnlyPinnedPhrases}
                />
                <FilterUntranslated
                  onClick={onToggleShowPinnedPhrases}
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
                <ChevronWrapper onClick={onToggleShowPinnedPhrases}>
                  <ChevronIcon
                    style={{
                      transform: showPinnedPhrases
                        ? "rotate(90deg)"
                        : "rotate(0deg)",
                    }}
                    src={chevronIcon}
                  />
                </ChevronWrapper>
                {showPinnedPhrases && (
                  <div
                    style={{
                      position: "absolute",
                      top: 40,
                      left: 32,
                      width: 350,
                      height: 500,
                      borderRadius: 8,
                      background: theme.background,
                      padding: 16,
                      boxShadow: `0px 0px 6px 6px ${theme.shadows.outerDropdown}`,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: 56,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: `1px solid ${ColorPalette.gray}`,
                      }}
                    >
                      <PinnedText>{"Pinned Phrases"}</PinnedText>
                      <CrossIcon
                        onClick={() => {
                          setShowPinnedPhrases(false);
                        }}
                        src={crossIcon}
                      />
                    </div>
                    <div
                      style={{
                        width: "100%",
                        flexGrow: 1,
                        paddingTop: 16,
                        paddingBottom: 16,
                        overflowY: "scroll",
                      }}
                    >
                      {formattedPinnedPhrases?.map(
                        ({ phraseGroup, phrases }, index) => {
                          return (
                            <div
                              key={index}
                              style={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                textAlign: "left",
                              }}
                            >
                              <Pinned style={{ fontWeight: 600 }}>
                                {phraseGroup.name}
                              </Pinned>
                              <ul
                                style={{
                                  paddingLeft: 16,
                                  margin: 0,
                                  width: "100%",
                                  paddingTop: 8,
                                  paddingBottom: 8,
                                }}
                              >
                                {phrases.map((phrase, innnerIndex) => {
                                  return (
                                    <li
                                      style={{
                                        width: "100%",
                                        height: 48,
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginTop: 8,
                                        marginBottom: 8,
                                      }}
                                      key={innnerIndex}
                                    >
                                      <Pinned
                                        style={{
                                          color: theme.colors.titleText,
                                          textAlign: "left",
                                        }}
                                      >{`${phrase.phraseKey}`}</Pinned>
                                      <img
                                        src={clearIcon}
                                        onClick={() => {
                                          const next =
                                            props.pinnedPhrases?.filter((p) => {
                                              const ref = makeQueryRef(
                                                "$(text).phraseGroups.id<?>.phrases.id<?>",
                                                phraseGroup.id,
                                                phrase.id
                                              );
                                              return ref != p;
                                            }) ?? [];
                                          props.setPinnedPhrases(next);
                                        }}
                                        style={{
                                          marginLeft: 24,
                                          height: 28,
                                          width: 28,
                                          cursor: "pointer",
                                        }}
                                      />
                                    </li>
                                  );
                                })}
                              </ul>
                              {false && (
                                <img
                                  src={clearIcon}
                                  onClick={() => {
                                    const next =
                                      props.pinnedGroups?.filter((p) => {
                                        const ref = makeQueryRef(
                                          "$(text).phraseGroups.id<?>",
                                          phraseGroup.id
                                        );
                                        return ref != p;
                                      }) ?? [];
                                    props.setPinnedGroups(next);
                                  }}
                                  style={{
                                    height: 24,
                                    width: 24,
                                    cursor: "pointer",
                                  }}
                                />
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 56,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderTop: `1px solid ${ColorPalette.gray}`,
                      }}
                    >
                      <ClearText
                        onClick={() => {
                          props.setPinnedPhrases([]);
                        }}
                      >
                        {"clear all pinned phrases"}
                      </ClearText>
                    </div>
                  </div>
                )}
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
