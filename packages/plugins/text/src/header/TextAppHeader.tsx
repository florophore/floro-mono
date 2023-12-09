import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import Input from "@floro/storybook/stories/design-system/Input";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";
import { useFloroContext, useFloroState, useHasIndication, useReferencedObject } from "../floro-schema-api";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

import XCircleLight from '@floro/common-assets/assets/images/icons/x_circle.light.svg';
import XCircleDark from '@floro/common-assets/assets/images/icons/x_circle.dark.svg';

const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
  margin-bottom: 24px;
  max-width: 1020px;
  width: 100%;
`;

const SectionTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.pluginTitle};
  padding: 0;
  margin: 0;
`;

const TitleRow = styled.div`
  height: 72px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const TopRow = styled.div`
  height: 72px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const AddGroupContainer = styled.div`
  margin-top: -12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 620px;
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
  margin-left: 12px;
`;

const Icon = styled.img`
  width: 24px;
  cursor: pointer;
`;
const ClearIconContainer =styled.div`
    height: 48px;
    width: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
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

interface Props {
  onSetSearchText: (str: string) => void;
  searchText: string;
  isEditGroups: boolean;
  onShowEditGroups: () => void;
  onHideEditGroups: () => void;
  selectedTopLevelLocale: string;
  setSelectedTopLevelLocale: (localeCode: string) => void;
  globalFilterUntranslated: boolean;
  setGlobalFilterUnstranslated: (filter: boolean) => void;
  filterTag: string|null;
  setFilterTag: (tag: string|null) => void;
  globalFilterRequiresUpdate: boolean;
  setGlobalFilterRequiresUpdate: (filter: boolean) => void;
  showOnlyPinnedPhrases: boolean;
  setShowOnlyPinnedPhrases: (filter: boolean) => void;
  pinnedPhrases: Array<string>|null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  removePinnedPhrases: () => void;
}

const TextAppHeader = (props: Props) => {
  const theme = useTheme();
  const { commandMode, applicationState, clientStorage } = useFloroContext();
  const clientStorageIsEnabled = clientStorage != null;
  const isSearching = useMemo(
    () => props.searchText.trim() != "",
    [props.searchText]
  );
  const [newGroupName, setNewGroupName] = useState("");
  const [phraseGroups, setPhraseGroups] = useFloroState("$(text).phraseGroups");

  useEffect(() => {
    if ((props.pinnedPhrases?.length ?? 0) == 0 && clientStorageIsEnabled && props.showOnlyPinnedPhrases) {
      props.setShowOnlyPinnedPhrases(false);
    }
  }, [props.pinnedPhrases, props.showOnlyPinnedPhrases, clientStorageIsEnabled])

  const hasPinnedPhrases = useMemo(() => {
    return clientStorageIsEnabled && (props.pinnedPhrases?.length ?? 0) > 0;
  }, [props.pinnedPhrases, clientStorageIsEnabled]);


  const allTags = useMemo(() => {
    const tagSet =  new Set(phraseGroups?.flatMap(phraseGroup => {
      return phraseGroup?.phrases?.flatMap(phrase => {
        return phrase.tags;
      })
    })?.filter(v => !!v));
    const sortedTags = Array.from(tagSet).sort();
    return [
      {
        label: "None",
        value: null,
      },
      ...sortedTags.map((tag) => {
        return {
          label: tag,
          value: tag,
        };
      }),
    ];
  }, [phraseGroups, applicationState]);

  const searchBorderColor = useMemo(() => {
    if (theme.name == "light") {
      return ColorPalette.gray;
    }
    return ColorPalette.gray;
  }, [theme.name]);

  const newId = useMemo((): string | null => {
    if (!newGroupName || (newGroupName?.trim?.() ?? "") == "") {
      return null;
    }
    return (
      newGroupName?.trim?.()?.replaceAll?.(/ +/g, "_")?.toLowerCase?.() ?? null
    );
  }, [newGroupName]);

  const canAddNewName = useMemo(() => {
    if (!newId) {
      return false;
    }
    for (const { id } of phraseGroups ?? []) {
      if (id == newId) {
        return false;
      }
    }
    return true;
  }, [newId, phraseGroups]);

  const onPrependNewGroup = useCallback(() => {
    if (!newId || !newGroupName || !canAddNewName || !phraseGroups) {
      return;
    }
    setPhraseGroups([
      { id: newId, name: newGroupName, phrases: [] },
      ...phraseGroups,
    ]);
    setNewGroupName("");
  }, [newGroupName, newId, canAddNewName, phraseGroups]);

  const onToggleFilterUntranslated = useCallback(() => {
    props.setGlobalFilterUnstranslated(!props.globalFilterUntranslated);
  }, [props.globalFilterUntranslated])

  const onToggleFilterRequiresUpdate = useCallback(() => {
    props.setGlobalFilterRequiresUpdate(!props.globalFilterRequiresUpdate);
  }, [props.globalFilterRequiresUpdate])

  const clearIcon = useMemo(() => {
      if (theme.name == 'light') {
        return XCircleLight;
      }
      return XCircleDark;
  }, [theme.name])

  const onClearFilterTag = useCallback(() => {
      props.setFilterTag(null);
  }, [props.setFilterTag])

  const onClearPinnedPhrases = useCallback(() => {
    props.removePinnedPhrases?.();
  }, [props.removePinnedPhrases, props.setShowOnlyPinnedPhrases]);

  useEffect(() => {
    if (props.showOnlyPinnedPhrases) {
      props.setGlobalFilterRequiresUpdate(false);
      props.setGlobalFilterUnstranslated(false);
      props.onSetSearchText("");
    }
  }, [props.showOnlyPinnedPhrases])

  return (
    <div>
      <Container>
        <TopRow>
          <TitleRow>
            {(commandMode != "edit" || !props.isEditGroups) && (
              <>
                <SectionTitle>{"Phrases"}</SectionTitle>
                <div style={{ marginLeft: 24 }}>
                  <SearchInput
                    showClear
                    value={props.searchText}
                    placeholder={"search phrases"}
                    onTextChanged={props.onSetSearchText}
                    borderColor={searchBorderColor}
                    disabled={props.isEditGroups || props.showOnlyPinnedPhrases}
                  />
                </div>
              </>
            )}

            {commandMode == "edit" && props.isEditGroups && (
              <AddGroupContainer style={{ marginLeft: 0 }}>
                <Input
                  value={newGroupName}
                  label={"new phrase group"}
                  placeholder={"phrase group name"}
                  onTextChanged={setNewGroupName}
                  widthSize="wide"
                />
                <Button
                  onClick={onPrependNewGroup}
                  style={{ marginTop: 14, marginLeft: 24 }}
                  label={"add group"}
                  bg={"orange"}
                  size={"small"}
                  isDisabled={!canAddNewName}
                />
              </AddGroupContainer>
            )}

            <div>
              {props.isEditGroups && commandMode == "edit" && (
                <div style={{ marginLeft: 24, display: "flex", width: 120 }}>
                  <Button
                    onClick={props.onHideEditGroups}
                    label={"done editting"}
                    bg={"purple"}
                    size={"small"}
                    textSize={"small"}
                  />
                </div>
              )}
              {commandMode == "edit" && (
                <>
                  <div style={{ display: "flex" }}>
                    {!props.isEditGroups && (
                      <div style={{ marginLeft: 24, width: 120 }}>
                        <Button
                          onClick={props.onShowEditGroups}
                          label={"edit groups"}
                          bg={"purple"}
                          size={"small"}
                          textSize={"small"}
                          isDisabled={isSearching}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </TitleRow>
        </TopRow>
        <Row
          style={{
            marginTop: 24,
            justifyContent: "space-between",
            alignItems: "center",
            minWidth: 1020,
            marginLeft: 0,
            marginBottom: 12,
          }}
        >
          <Row>
            <FilterUntranslated style={{ marginTop: -2, marginLeft: 0 }}>
              {"Filter on tag"}
            </FilterUntranslated>
            <div
              style={{
                marginTop: -12,
                marginLeft: 12,
                display: "flex",
                flexDirection: "row",
              }}
            >
              <InputSelector
                options={allTags}
                value={props.filterTag}
                label={"filter on tag"}
                placeholder={"select tag to filter on"}
                onChange={(option) => {
                  props.setFilterTag((option?.value as string) ?? null);
                }}
                size="shortest"
              />
            </div>
            {props.filterTag && (
              <ClearIconContainer>
                <Icon src={clearIcon} onClick={onClearFilterTag} />
              </ClearIconContainer>
            )}
          </Row>
          <Row>
            <FilterUntranslated
              style={{
                marginLeft: 0,
                marginRight: 12,
                color: props.globalFilterUntranslated
                  ? theme.colors.warningTextColor
                  : theme.colors.contrastTextLight,
              }}
            >
              {`Filter un-translated (${props.selectedTopLevelLocale}) phrases for all groups`}
            </FilterUntranslated>
            <Checkbox
              isChecked={props.globalFilterUntranslated}
              onChange={onToggleFilterUntranslated}
            />
          </Row>
        </Row>
        <Row
          style={{
            marginTop: 12,
            justifyContent: "space-between",
            alignItems: "center",
            minWidth: 1020,
          }}
        >
          <div>
            <Row>
              {hasPinnedPhrases && (
                <>
                  <FilterUntranslated
                    style={{
                      marginLeft: 0,
                      marginRight: 12,
                      fontWeight: 600,
                      color: props.showOnlyPinnedPhrases
                        ? theme.colors.warningTextColor
                        : theme.colors.contrastTextLight,
                    }}
                  >
                    {`Show Only pinned phrases`}
                  </FilterUntranslated>
                  <Checkbox
                    isChecked={props.showOnlyPinnedPhrases}
                    onChange={props.setShowOnlyPinnedPhrases}
                  />
                </>
              )}
            </Row>
          </div>
          <Row>
            <FilterUntranslated
              style={{
                marginLeft: 0,
                marginRight: 12,
                color: props.globalFilterRequiresUpdate
                  ? theme.colors.warningTextColor
                  : theme.colors.contrastTextLight,
              }}
            >
              {`Filter (${props.selectedTopLevelLocale}) phrases to update for all groups`}
            </FilterUntranslated>
            <Checkbox
              isChecked={props.globalFilterRequiresUpdate}
              onChange={onToggleFilterRequiresUpdate}
            />
          </Row>
        </Row>
        <Row style={{ height: 72 }}>
          {hasPinnedPhrases && (
            <div>
              <SubTitle onClick={onClearPinnedPhrases}>
                {`clear all pinned phrases (${props.pinnedPhrases?.length})`}
              </SubTitle>
            </div>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default React.memo(TextAppHeader);
