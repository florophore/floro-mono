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
import Term from "../phrases/termdisplay/Term";
import AddTermModal from "./AddTermModal";

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
  onSetSearchTermText: (str: string) => void;
  searchTermText: string;
  isEditTerms: boolean;
  onShowEditTerms: () => void;
  onHideEditTerms: () => void;
  globalFilterUntranslatedTerms: boolean;
  setGlobalFilterUnstranslatedTerms: (filter: boolean) => void;
  showOnlyPinnedTerms: boolean;
  setShowOnlyPinnedTerms: (filter: boolean) => void;
  pinnedTerms: Array<string> | null;
  setPinnedTerms: (phraseRegs: Array<string>) => void;
  removePinnedTerms: () => void;
  selectedTopLevelLocale: string;
  terms: SchemaTypes['$(text).terms'];
  filteredTerms: SchemaTypes["$(text).terms"];
  onSetTerms: (terms: SchemaTypes['$(text).terms']) => void;
  selectedTerm: string|null;
  setSelectedTerm: (term: string|null) => void;
}

const TermHeader = (props: Props) => {
  const theme = useTheme();

  const { commandMode, applicationState } = useFloroContext();
  const [showPinnedTerms, setShowPinnedTerms] = useState(false);
  const [showAddTerm, setShowAddTerm] = useState(false);
  const pinnedTermsContainer = useRef<HTMLDivElement>(null);

  const onToggleShowPinnedTerms = useCallback(() => {
    setShowPinnedTerms(!showPinnedTerms);
  }, [showPinnedTerms]);

  useEffect(() => {
    const onWindowClick = (e: Event) => {
      if (!showPinnedTerms) {
        return;
      }
      if (pinnedTermsContainer.current && !pinnedTermsContainer.current.contains(e.target as Node)) {
          setShowPinnedTerms(false);
      }
    }
    document.addEventListener("click", onWindowClick);
    return () => {
        document.removeEventListener("click", onWindowClick);
    }
  }, [pinnedTermsContainer.current, showPinnedTerms]);

  const pinnedTerms = useMemo(() => {
    return props.terms.filter((term) => {
      const phraseGroupRef = makeQueryRef(
        "$(text).terms.id<?>",
        term.id
      );
      return props.pinnedTerms?.includes(phraseGroupRef);
    });
  }, [props.terms, props.pinnedTerms]);

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

  const termOptions = useMemo(() => {
    return props.filteredTerms.map((term) => {
      const phraseGroupRef = makeQueryRef(
        "$(text).terms.id<?>",
        term?.id as string
      );
      return {
        label: term.name,
        value: phraseGroupRef,
      };
    });
  }, [props.filteredTerms]);

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
      props.onSetSearchTermText(props.searchTermText);
    }, 300);
    return () => {
      clearTimeout(timeout);
    };
  }, [
    props.searchTermText,
    props.selectedTopLevelLocale,
    props.onSetSearchTermText,
  ]);

  useEffect(() => {
    if (Object.keys(applicationState ?? {}).length == 0) {
      return;
    }
    if (
      pinnedTerms?.length == 0 &&
      props.showOnlyPinnedTerms
    ) {
      props.setShowOnlyPinnedTerms(false);
    }
  }, [
    applicationState,
    pinnedTerms?.length,
    props.showOnlyPinnedTerms,
    props.setShowOnlyPinnedTerms,
  ]);


  const hasFiltersOn = useMemo(() => {
    return (
      props.globalFilterUntranslatedTerms
    );
  }, [
    props.globalFilterUntranslatedTerms
  ]);

  useEffect(() => {
    if (hasFiltersOn && props.isEditTerms) {
      props.onHideEditTerms();
    }
  }, [props.onHideEditTerms, hasFiltersOn, props.isEditTerms]);

  useEffect(() => {
    if ((pinnedTerms?.length ?? 0) == 0) {
      setShowPinnedTerms(false);
    }
  }, [pinnedTerms?.length ?? 0]);

  useEffect(() => {
    if (props.selectedTerm) {
      props.setSelectedTerm(null);
    }
  }, [props.selectedTerm, props.setSelectedTerm])


  return (
    <Container>
      <AddTermModal
        show={showAddTerm}
        onDismiss={(): void => {
          setShowAddTerm(false);
        }}
        terms={props.terms ?? []}
        setTerms={props.onSetTerms}
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
              value={props.searchTermText}
              placeholder={`search terms (${locale?.localeCode})`}
              onTextChanged={props.onSetSearchTermText}
              borderColor={searchBorderColor}
              disabled={props.isEditTerms}
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
              {!props.isEditTerms && (
                <div style={{ marginTop: -24 }}>
                  <div style={{ display: "flex" }}>
                    <InputSelector
                      value={props.selectedTerm}
                      size={"regular"}
                      options={termOptions}
                      label={"terms"}
                      placeholder={"select term"}
                      onChange={(option) => {
                        props.setSelectedTerm(
                          (option?.value as PointerTypes["$(text).terms.id<?>"]) ??
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
                    label={"+ add term"}
                    bg={"orange"}
                    size={"medium"}
                    isDisabled={props.showOnlyPinnedTerms || hasFiltersOn}
                    onClick={() => {
                      setShowAddTerm(true);
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
          {(pinnedTerms?.length ?? 0) > 0 && !props.isEditTerms && (
            <Row
              ref={pinnedTermsContainer}
              style={{ width: 400, position: "relative" }}
            >
              <Checkbox
                isChecked={props.showOnlyPinnedTerms}
                onChange={props.setShowOnlyPinnedTerms}
              />
              <FilterUntranslated
                onClick={onToggleShowPinnedTerms}
                style={{
                  marginLeft: 12,
                  fontWeight: 600,
                  color: props.showOnlyPinnedTerms
                    ? theme.colors.warningTextColor
                    : theme.colors.contrastText,
                }}
              >
                {(pinnedTerms.length ?? 0) == 0
                  ? `Show Only Pinned Terms`
                  : `Show Only Pinned Terms (${pinnedTerms.length})`}
              </FilterUntranslated>
              <ChevronWrapper onClick={onToggleShowPinnedTerms}>
                <ChevronIcon
                  src={chevronIcon}
                  style={{
                    transform: showPinnedTerms
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                  }}
                />
              </ChevronWrapper>
              {showPinnedTerms && (pinnedTerms?.length ?? 0) && (
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
                    <PinnedText>{"Pinned Terms"}</PinnedText>
                    <CrossIcon
                      onClick={() => {
                        setShowPinnedTerms(false);
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
                    {pinnedTerms?.map((pinnedTerm, index) => {
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
                          <Pinned>{pinnedTerm.name}</Pinned>
                          <img
                            src={clearIcon}
                            onClick={() => {
                              const next =
                                props.pinnedTerms?.filter((p) => {
                                  const ref = makeQueryRef(
                                    "$(text).terms.id<?>",
                                    pinnedTerm.id
                                  );
                                  return ref != p;
                                }) ?? [];
                              console.log("N", next);
                              props.setPinnedTerms(next);
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
                        props.setPinnedTerms([]);
                      }}
                    >
                      {"clear all pinned terms"}
                    </ClearText>
                  </div>
                </div>
              )}
            </Row>
          )}
        </Row>
        {commandMode == "edit" &&
          !hasFiltersOn &&
          props.terms.length > 0 &&
          !props.showOnlyPinnedTerms && (
            <SubTitleRow>
              {!props.isEditTerms && (
                <SubTitle
                  onClick={props.onShowEditTerms}
                >{`organize terms`}</SubTitle>
              )}
              {props.isEditTerms && (
                <SubTitle
                  onClick={props.onHideEditTerms}
                >{`done organizing terms`}</SubTitle>
              )}
            </SubTitleRow>
          )}
      </BottomRow>
    </Container>
  );
};

export default React.memo(TermHeader);
