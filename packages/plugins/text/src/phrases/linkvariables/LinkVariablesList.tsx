import React, { useMemo, useCallback, useState } from "react";
import { useTheme } from "@emotion/react";
import { PointerTypes, SchemaTypes, useFloroContext, useFloroState, useReferencedObject } from "../../floro-schema-api";
import { AnimatePresence, Reorder } from "framer-motion";
import styled from "@emotion/styled";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";

import LinkVariableReOrderRow from "./LinkVariableReOrderRow";
import ColorPalette from "@floro/styles/ColorPalette";
import LinkVariable from "./LinkVariable";
import { useDiffColor } from "../../diff";


const Container = styled.div`
    margin-top: 24px;
`;

const AddVariableContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
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


const ToggleEditTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${ColorPalette.linkBlue};
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
`;

const MissingTranslationsPill = styled.div`
  height: 24px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${props => props.theme.colors.warningTextColor};
  padding-left: 12px;
  padding-right: 12px;
  margin-left: 12px;
`;

const MissingTranslationsTitle = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1rem;
  color: ${ColorPalette.white};
`;

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]|null;
  fallbackLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]|null;
  pinnedPhrases: Array<string> | null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
  isPinned: boolean;
  searchText: string;
  isSearching: boolean;
  onFocusSearch: () => void;
}

const LinkVariableList = (props: Props) => {
  const [name, setName] = useState<string>("");
  const { commandMode, applicationState} = useFloroContext();
  const [_isDragging, setIsDragging] = useState(false);

  const [linkVariables, setLinkVariables, saveLinkVariables] = useFloroState(`${props.phraseRef}.linkVariables`);
  const variables = useReferencedObject(`${props.phraseRef}.variables`)
  const interpolationVariants = useReferencedObject(`${props.phraseRef}.interpolationVariants`)
  const styledContents = useReferencedObject(`${props.phraseRef}.styledContents`)
  const contentVariables = useReferencedObject(`${props.phraseRef}.contentVariables`)

  const isMissingValues = useMemo(() => {
    const localeRef = `$(text).localeSettings.locales.localeCode<${props.selectedLocale.localeCode}>`;
    const fallbackLocaleRef = `$(text).localeSettings.locales.localeCode<${props.fallbackLocale?.localeCode}>`;
    for (const lv of linkVariables ?? []) {
      for (const translation of lv?.translations ?? []) {
        if (translation.id != localeRef) {
          continue;
        }
        if ((translation.linkDisplayValue?.plainText ?? "") == "") {
          return true;
        }
        if ((translation.linkHrefValue?.plainText ?? "") == "") {
          const fallbackHref = lv?.translations.find(v => v.id == fallbackLocaleRef);
          if ((fallbackHref?.linkHrefValue?.plainText ?? "") == "") {
            return true;
          }
        }
      }
    }
    return false;
  }, [linkVariables, applicationState, props.selectedLocale.localeCode, props.fallbackLocale?.localeCode])

  const varSet = useMemo(() => {
    return new Set([
      ...variables?.map?.((v) => v.name?.toLowerCase?.() as string) ?? [],
      ...interpolationVariants?.map?.((iv) => iv.name?.toLowerCase() as string) ?? [],
      ...linkVariables?.map?.((l) => l.linkName?.toLowerCase() as string) ?? [],
      ...styledContents?.map?.((sc) => sc.name?.toLowerCase() as string) ?? [],
      ...contentVariables?.map?.((cv) => cv.name?.toLowerCase() as string) ?? [],
    ]);
  }, [variables, linkVariables, interpolationVariants, styledContents, contentVariables]);

  const isNameTaken = useMemo(() => {
    return varSet.has(name?.toLowerCase());
  }, [name, varSet])

  const showNameInputInvalid = useMemo(() => {
    if (name == "") {
        return true;
    }
    if (isNameTaken) {
        return false;
    }
    return name.trim() != "";
  }, [name, isNameTaken]);

  const onChangeName = useCallback((name) => {
    setName(name.toLowerCase());
  },[]);

  const isEnabled = useMemo(() => {
    if (isNameTaken) {
        return false;
    }
    return name.trim() != "";
  }, [name, isNameTaken]);

  const onAppendLinkVariable = useCallback(() => {
    if (!isEnabled) {
        return;
    }
    setLinkVariables([...(props.phrase.linkVariables ? props.phrase.linkVariables : []), {
        linkName: name.trim(),
        translations: []
      }]
    );
    setName("");
  }, [props.phrase.linkVariables, setLinkVariables, name, isEnabled]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    saveLinkVariables();
  }, [saveLinkVariables]);

  const onReOrderVariables = useCallback(
    (values: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables']) => {
        if (values) {
            setLinkVariables(values, false);
        }
    },
    [setLinkVariables, variables]
  );

  const onRemoveLinkVar = useCallback(
    (linkVariable: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>']) => {
        setLinkVariables(linkVariables?.filter(v => v?.linkName != linkVariable?.linkName) ?? []);
    },
    [setLinkVariables, linkVariables]
  )

  const [isReOrderMode, setIsReOrderMode] = useState(false);

  const diffColor = useDiffColor(`${props.phraseRef}.linkVariables`, true, 'darker');

  const onToggleReOrder = useCallback(() => {
    setIsReOrderMode(!isReOrderMode);
  }, [isReOrderMode])

  if (commandMode != "edit" && (linkVariables?.length ?? 0) == 0) {
    return null;
  }

  return (
    <Container>
      <TitleRow style={{ marginTop: 12, marginBottom: 12, height: 40 }}>
        <RowTitle
          style={{
            fontWeight: 600,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <span style={{ color: diffColor }}>
            {`Link Variables`}
          </span>
          <span>
            {isMissingValues && (
              <MissingTranslationsPill>
                <MissingTranslationsTitle>{`missing ${props.selectedLocale.localeCode} link values`}</MissingTranslationsTitle>
              </MissingTranslationsPill>
            )}
          </span>
        </RowTitle>
        {(linkVariables?.length ?? 0) > 0 && commandMode == "edit" && !props.isSearching &&(
          <ToggleEditTitle onClick={onToggleReOrder}>{isReOrderMode ? 'done organizing' : 'organize link variables'}</ToggleEditTitle>
        )}
      </TitleRow>
      {isReOrderMode && commandMode == "edit" && !props.isSearching && (
        <Reorder.Group
          axis="y"
          values={linkVariables ?? []}
          onReorder={onReOrderVariables}
          style={{listStyle: "none", margin: 0, padding: 0 }}
        >
          <AnimatePresence>
            {linkVariables?.map((linkVariable, index) => {
              return (
                <LinkVariableReOrderRow
                  key={linkVariable.linkName}
                  linkVariable={linkVariable}
                  index={index}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      )}
      {(!isReOrderMode || commandMode != "edit" || props.isSearching) && (
        <div>
          {linkVariables?.map((linkVariable, index) => {
            return (
              <LinkVariable
                key={linkVariable.linkName}
                linkVariable={linkVariable}
                phrase={props.phrase}
                linkRef={`${props.phraseRef}.linkVariables.linkName<${linkVariable.linkName}>`}
                selectedLocale={props.selectedLocale}
                systemSourceLocale={props.systemSourceLocale}
                fallbackLocale={props.fallbackLocale}
                globalFilterUntranslated={props.globalFilterUntranslated}
                pinnedPhrases={props.pinnedPhrases}
                setPinnedPhrases={props.setPinnedPhrases}
                isPinned={props.isPinned}
                phraseRef={props.phraseRef}
                onRemove={onRemoveLinkVar}
                searchText={props.searchText}
                isSearching={props.isSearching}
                onFocusSearch={props.onFocusSearch}
              />
            );
          })}
        </div>
      )}
      {commandMode == "edit" && !props.isSearching && (
        <AddVariableContainer
          style={{ justifyContent: "space-between", alignItems: "center", marginTop: 12 }}
        >
          <AddVariableContainer>
            <div>
              <Input
                value={name}
                label={
                  showNameInputInvalid
                    ? "link variable name"
                    : isNameTaken
                    ? `link variable name (name taken)`
                    : `link variable name (invalid name)`
                }
                placeholder={"link variable name"}
                onTextChanged={onChangeName}
                widthSize="shorter"
                isValid={showNameInputInvalid}
              />
            </div>
          </AddVariableContainer>
          <div style={{ marginTop: 12 }}>
            <Button
              size="medium"
              label={"add link variable"}
              bg={"teal"}
              isDisabled={!isEnabled}
              onClick={onAppendLinkVariable}
              style={{
                width: 200
              }}
            />
          </div>
        </AddVariableContainer>
      )}
    </Container>
  );
};

export default React.memo(LinkVariableList);
