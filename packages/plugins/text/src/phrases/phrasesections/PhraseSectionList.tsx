import React, { useMemo, useCallback, useState } from "react";
import { useTheme } from "@emotion/react";
import { PointerTypes, SchemaTypes, useFloroContext, useFloroState, useReferencedObject } from "../../floro-schema-api";
import { AnimatePresence, Reorder } from "framer-motion";
import styled from "@emotion/styled";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";

import InputSelector, { Option } from "@floro/storybook/stories/design-system/InputSelector";
import ColorPalette from "@floro/styles/ColorPalette";
import { useDiffColor } from "../../diff";
import StyledContent from "./PhraseSection";
import StyledContentReOrderRow from "./PhraseSectionReOrderRow";
import PhraseSection from "./PhraseSection";

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

const BusinessLogicDisclaimer = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${props => props.theme.colors.contrastText};
`;

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]|null;
  pinnedPhrases: Array<string> | null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
  isPinned: boolean;
}

const PhraseSectionsList = (props: Props) => {
  const theme = useTheme();

  const [name, setName] = useState<string>("");
  const { commandMode, applicationState} = useFloroContext();

  const [_isDragging, setIsDragging] = useState(false);
  const diffColor = useDiffColor(`${props.phraseRef}.phraseSections`);

  const [phraseSections, setPhraseSections] = useFloroState(`${props.phraseRef}.phraseSections`);

  const varSet = useMemo(() => {
    return new Set([
      ...phraseSections?.map?.((ps) => ps.name?.toLowerCase?.() as string) ?? [],
    ]);
  }, [phraseSections]);


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
    setName(name);
  },[]);

  const isEnabled = useMemo(() => {
    if (isNameTaken) {
        return false;
    }
    return name.trim() != "";
  }, [name, isNameTaken]);

  const onAppendPhraseSection = useCallback(() => {
    if (!isEnabled) {
        return;
    }
    setPhraseSections([...(props.phrase.phraseSections ? props.phrase.phraseSections : []), {
        name: name.trim(),
        localeRules: []
      }]
    );
    setName("");
  }, [props.phrase.phraseSections, setPhraseSections, name, isEnabled]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    //save();
  }, []);


  const onReOrderVariables = useCallback(
    (values: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections']) => {
        if (values) {
            setPhraseSections(values);
        }
    },
    [setPhraseSections, phraseSections]
  );

  const onRemovePhraseSection = useCallback(
    (phraseSection: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>']) => {
        setPhraseSections(phraseSections?.filter(v => v?.name != phraseSection?.name) ?? []);
    },
    [setPhraseSections, phraseSections]
  )

  const [isReOrderMode, setIsReOrderMode] = useState(false);

  const onToggleReOrder = useCallback(() => {
    setIsReOrderMode(!isReOrderMode);
  }, [isReOrderMode]);

  const isMissingValues = useMemo(() => {
    const localeRef = `$(text).localeSettings.locales.localeCode<${props.selectedLocale.localeCode}>`;
    for (const ps of phraseSections ?? []) {
      for (const localeRule of ps?.localeRules ?? []) {
        if (localeRule.id != localeRef) {
          continue;
        }
        if ((localeRule.displayValue?.plainText ?? "") == "") {
          return true;
        }
      }
    }
    return false;
  }, [phraseSections, applicationState, props.selectedLocale.localeCode])

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
          <span style={{ color: diffColor }}>{`Phrase Sections`}</span>
          <span>
            {isMissingValues && (
              <MissingTranslationsPill>
                <MissingTranslationsTitle>{`missing ${props.selectedLocale.localeCode} sections`}</MissingTranslationsTitle>
              </MissingTranslationsPill>
            )}
            {props.phrase.phraseSections.length == 0 && (
              <MissingTranslationsPill>
                <MissingTranslationsTitle>{`no sections`}</MissingTranslationsTitle>
              </MissingTranslationsPill>
            )}
          </span>
        </RowTitle>
        {(phraseSections?.length ?? 0) > 0 && commandMode == "edit" && (
          <ToggleEditTitle onClick={onToggleReOrder}>
            {isReOrderMode
              ? "done organizing"
              : "organize sections"}
          </ToggleEditTitle>
        )}
      </TitleRow>
      {isReOrderMode && commandMode == "edit" && (
        <Reorder.Group
          axis="y"
          values={phraseSections ?? []}
          onReorder={onReOrderVariables}
          style={{ listStyle: "none", margin: 0, padding: 0 }}
        >
          <AnimatePresence>
            {phraseSections?.map((phraseSection, index) => {
              return (
                <StyledContentReOrderRow
                  key={phraseSection.name}
                  phraseSection={phraseSection}
                  index={index}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      )}
      {(!isReOrderMode || commandMode != "edit") && (
        <div>
          {phraseSections?.map((phraseSection) => {
            return (
              <PhraseSection
                key={`${props.phraseRef}.phraseSections.name<${phraseSection.name}>`}
                phraseSection={phraseSection}
                phrase={props.phrase}
                phraseSectionRef={`${props.phraseRef}.phraseSections.name<${phraseSection.name}>`}
                selectedLocale={props.selectedLocale}
                systemSourceLocale={props.systemSourceLocale}
                globalFilterUntranslated={props.globalFilterUntranslated}
                pinnedPhrases={props.pinnedPhrases}
                setPinnedPhrases={props.setPinnedPhrases}
                isPinned={props.isPinned}
                phraseRef={props.phraseRef}
                onRemove={onRemovePhraseSection}
              />
            );
          })}
        </div>
      )}
      {commandMode == "edit" && (
        <AddVariableContainer
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <AddVariableContainer
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <div>
              <Input
                value={name}
                label={
                  showNameInputInvalid
                    ? "section name"
                    : isNameTaken
                    ? `section name (name taken)`
                    : `section name (invalid name)`
                }
                placeholder={"section name"}
                onTextChanged={onChangeName}
                widthSize="shorter"
                isValid={showNameInputInvalid}
              />
            </div>
          </AddVariableContainer>
          <div style={{ marginTop: 24 }}>
            <Button
              size="medium"
              label={"add section"}
              bg={"purple"}
              isDisabled={!isEnabled}
              onClick={onAppendPhraseSection}
              style={{
                width: 200,
              }}
            />
          </div>
        </AddVariableContainer>
      )}
    </Container>
  );
};

export default React.memo(PhraseSectionsList);