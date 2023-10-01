import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import Input from "@floro/storybook/stories/design-system/Input";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";
import {
  useClientStorageApi,
  useExtractQueryArgs,
  useFloroContext,
  useFloroState,
  useReferencedObject,
} from "../floro-schema-api";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

import XCircleLight from "@floro/common-assets/assets/images/icons/x_circle.light.svg";
import XCircleDark from "@floro/common-assets/assets/images/icons/x_circle.dark.svg";

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
}

const TermGlossaryHeader = (props: Props) => {
  const theme = useTheme();
  const { commandMode, clientStorage } = useFloroContext();
  const clientStorageIsEnabled = clientStorage != null;
  const isSearching = useMemo(
    () => props.searchTermText.trim() != "",
    [props.searchTermText]
  );
  const [newTermName, setNewTermName] = useState("");
  const [terms, setTerms] = useFloroState("$(text).terms");

  useEffect(() => {
    if (
      (props.pinnedTerms?.length ?? 0) == 0 &&
      clientStorageIsEnabled &&
      props.showOnlyPinnedTerms
    ) {
      props.setShowOnlyPinnedTerms(false);
    }
  }, [props.pinnedTerms, props.showOnlyPinnedTerms, clientStorageIsEnabled]);

  const hasPinnedPhrases = useMemo(() => {
    return clientStorageIsEnabled && (props.pinnedTerms?.length ?? 0) > 0;
  }, [props.pinnedTerms, clientStorageIsEnabled]);

  const searchBorderColor = useMemo(() => {
    if (theme.name == "light") {
      return ColorPalette.gray;
    }
    return ColorPalette.gray;
  }, [theme.name]);

  const newId = useMemo((): string | null => {
    if (!newTermName || (newTermName?.trim?.() ?? "") == "") {
      return null;
    }
    return (
      newTermName?.trim?.()?.replaceAll?.(/ +/g, "_")?.toLowerCase?.() ?? null
    );
  }, [newTermName]);

  const canAddNewName = useMemo(() => {
    if (!newId) {
      return false;
    }
    for (const { id } of terms ?? []) {
      if (id == newId) {
        return false;
      }
    }
    return true;
  }, [newId, terms]);

  const onAppendNewGroup = useCallback(() => {
    if (!newId || !newTermName || !canAddNewName || !terms) {
      return;
    }
    setTerms([...terms, { id: newId, name: newTermName, localizedTerms: [] }]);
    setNewTermName("");
  }, [newTermName, newId, canAddNewName, terms]);

  const onToggleFilterUntranslated = useCallback(() => {
    props.setGlobalFilterUnstranslatedTerms(
      !props.globalFilterUntranslatedTerms
    );
  }, [props.globalFilterUntranslatedTerms]);

  useEffect(() => {
    if (props.showOnlyPinnedTerms) {
      props.setGlobalFilterUnstranslatedTerms(false);
      props.onSetSearchTermText("");
    }
  }, [props.showOnlyPinnedTerms]);

  const onClearPinnedTerms = useCallback(() => {
    props.removePinnedTerms?.();
  }, [props.removePinnedTerms, props.setShowOnlyPinnedTerms]);

  return (
    <div>
      <Container>
        <TopRow>
          <TitleRow>
            {(commandMode != "edit" || !props.isEditTerms) && (
              <>
                <SectionTitle>{"Term Glossary"}</SectionTitle>
                <div style={{ marginLeft: 24 }}>
                  <SearchInput
                    showClear
                    value={props.searchTermText}
                    placeholder={"search term glossary"}
                    onTextChanged={props.onSetSearchTermText}
                    borderColor={searchBorderColor}
                    disabled={props.isEditTerms || props.showOnlyPinnedTerms}
                  />
                </div>
              </>
            )}

            {commandMode == "edit" && props.isEditTerms && (
              <AddGroupContainer style={{ marginLeft: 0 }}>
                <Input
                  value={newTermName}
                  label={"new term"}
                  placeholder={"term name"}
                  onTextChanged={setNewTermName}
                  widthSize={"wide"}
                />
                <Button
                  onClick={onAppendNewGroup}
                  style={{ marginTop: 14, marginLeft: 24 }}
                  label={"add term"}
                  bg={"orange"}
                  size={"small"}
                  isDisabled={!canAddNewName}
                />
              </AddGroupContainer>
            )}
          </TitleRow>
          {commandMode == "edit" && (
            <div>
              {props.isEditTerms && (
                <div style={{ marginLeft: 24, display: "flex", width: 120 }}>
                  <Button
                    onClick={props.onHideEditTerms}
                    label={"done editting"}
                    bg={"purple"}
                    size={"small"}
                    textSize={"small"}
                  />
                </div>
              )}
              {!props.isEditTerms && (
                <>
                  <div style={{ display: "flex" }}>
                    <div style={{ marginLeft: 24, width: 120 }}>
                      <Button
                        onClick={props.onShowEditTerms}
                        label={"edit terms"}
                        bg={"purple"}
                        size={"small"}
                        textSize={"small"}
                        isDisabled={isSearching}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </TopRow>
        {!props.isEditTerms && (
          <>
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
              <Row></Row>
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
                          }}
                        >
                          {`Show Only pinned terms`}
                        </FilterUntranslated>
                        <Checkbox
                          isChecked={props.showOnlyPinnedTerms}
                          onChange={props.setShowOnlyPinnedTerms}
                        />
                      </>
                    )}
                  </Row>
                </div>
                <Row>
                  <FilterUntranslated style={{ marginLeft: 0, marginRight: 12 }}>
                    {`Filter un-translated (${props.selectedTopLevelLocale}) terms`}
                  </FilterUntranslated>
                  <Checkbox
                    isChecked={props.globalFilterUntranslatedTerms}
                    onChange={onToggleFilterUntranslated}
                  />
                </Row>
              </Row>
            </Row>
            <Row style={{ height: 72 }}>
              {hasPinnedPhrases && (
                <div>
                  <SubTitle onClick={onClearPinnedTerms}>
                    {`clear all pinned terms (${props.pinnedTerms?.length})`}
                  </SubTitle>
                </div>
              )}
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default React.memo(TermGlossaryHeader);
