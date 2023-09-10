import React, { useMemo, useCallback, useState, useEffect } from "react";
import { PointerTypes, SchemaTypes, makeQueryRef, useClientStorageApi, useExtractQueryArgs, useFloroContext, useFloroState, useReferencedObject } from "../floro-schema-api";
import { Reorder, useDragControls } from "framer-motion";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import DraggerLight from "@floro/common-assets/assets/images/icons/dragger.light.svg";
import DraggerDark from "@floro/common-assets/assets/images/icons/dragger.dark.svg";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import PhraseTranslation from "./phrasetranslation/PhraseTranslation";
import CreateTagsContainer from "./CreateTagsContainer";
import ColorPalette from "@floro/styles/ColorPalette";

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";

import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import { debugPort } from "process";

const Container = styled.div`
  padding: 0;
  margin-bottom: 8px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  padding: 16px;
  border-radius: 8px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 24px;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.7rem;
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

const DragIcon = styled.img`
  height: 24px;
  width: 24px;
  pointer-events: none;
  user-select: none;
`;

const DeleteVarContainer = styled.div`
  cursor: pointer;
  margin-left: 16px;
  padding-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DeleteVar = styled.img`
  height: 32px;
  width: 32px;
  pointer-events: none;
  user-select: none;
`;

const PinPhrase = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;



interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  index: number;
  selectedTopLevelLocale: string;
  pinnedPhrases: Array<string>|null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
}

const PhraseRow = (props: Props) => {
  const theme = useTheme();
  const locales = useReferencedObject("$(text).localeSettings.locales");
  const { applicationState, commandMode, clientStorage } = useFloroContext();
  const clientStorageIsEnabled = clientStorage != null;
  const [selectedLocaleCode, setSelectedLocaleCode] = useState(props.selectedTopLevelLocale);
  const localeSettings = useReferencedObject("$(text).localeSettings");
  const [phrase, setPhrase] = useFloroState(props.phraseRef);
  const selectedLocale = useMemo(
    () =>
      localeSettings.locales.find((l) => l.localeCode == selectedLocaleCode),
    [localeSettings.locales, selectedLocaleCode]
  );

  const systemSourceLocale = useMemo(() => {
    if (selectedLocale?.defaultTranslateFromLocaleRef) {
        return localeSettings.locales.find(
          (l) =>
            makeQueryRef(
              "$(text).localeSettings.locales.localeCode<?>",
              l.localeCode
            ) == selectedLocale.defaultTranslateFromLocaleRef
        ) ?? null;
    }
    if (
      localeSettings.defaultLocaleRef ==
      makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        selectedLocale?.localeCode as string
      )
    ) {
      return null;
    }
    return localeSettings.locales.find(
        (l) =>
        makeQueryRef(
            "$(text).localeSettings.locales.localeCode<?>",
            l.localeCode
        ) == localeSettings.defaultLocaleRef
    ) ?? null;

  }, [localeSettings.locales, localeSettings.defaultLocaleRef, selectedLocale]);

  useEffect(() => {
    setSelectedLocaleCode(props.selectedTopLevelLocale);
  }, [props.selectedTopLevelLocale])
  const localeOptions = useMemo(() => {
    return [
      ...locales
        ?.map((locale) => {
          return {
            label: `${locale.localeCode}`,
            value: locale.localeCode.toUpperCase(),
          };
        }) ?? []
    ];
  }, [locales]);

  const onUpdateTags = useCallback((tags: string[]) => {
    if (!phrase) {
      return;
    }
    setPhrase({
      ...phrase,
      tags
    });

  }, [phrase, setPhrase]);

  const hasUnTranslatedParts = useMemo(() => {
    const localeRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      props.selectedTopLevelLocale
    );
    const phraseTranslation = phrase?.phraseTranslations.find(
      (p) => p.id == localeRef
    );
    if ((phraseTranslation?.plainText ?? "") == "") {
      return true;
    }
    for (const linkVariable of phrase?.linkVariables ?? []) {
      const linkTranslation = linkVariable.translations.find(
        (t) => t.id == localeRef
      );
      if ((linkTranslation?.linkDisplayValue?.plainText ?? "") == "") {
        return true;
      }
      if ((linkTranslation?.linkHrefValue?.plainText ?? "") == "") {
        return true;
      }
    }
    for (const interpolationVariant of phrase?.interpolationVariants ?? []) {
      const localeRule = interpolationVariant.localeRules.find(
        (lr) => lr.id == localeRef
      );
      if ((localeRule?.defaultValue?.plainText ?? "") == "") {
        return true;
      }
      for (const conditional of localeRule?.conditionals ?? []) {
        if ((conditional.resultant?.plainText ?? "") == "") {
          return true;
        }
      }
    }

    return false;
  }, [applicationState, phrase, props.selectedTopLevelLocale]);


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

  const isPinned = useMemo(() => {
    return props.pinnedPhrases?.includes(props.phraseRef) ?? false;
  }, [props.pinnedPhrases, props.phraseRef, clientStorage]);

  const onTogglePin = useCallback(() => {
    if (props.pinnedPhrases?.includes(props.phraseRef)) {
      props.setPinnedPhrases(props.pinnedPhrases.filter(p => p != props.phraseRef))
    } else {
      props.setPinnedPhrases([...(props.pinnedPhrases ?? []), props.phraseRef]);
    }

  }, [isPinned, props.setPinnedPhrases, props.pinnedPhrases, props.phraseRef])

  return (
    <Container>
      <TitleRow>
        <RowTitle style={{ fontWeight: 600, marginTop: 0, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <span style={{ color: theme.colors.contrastText }}>
            {"Phrase Key: "}
          </span>
          <span style={{ color: theme.colors.titleText, marginLeft: 8 }}>
            {props.phrase.phraseKey}
          </span>
          <span>
            {hasUnTranslatedParts && (
                <MissingTranslationsPill>
                  <MissingTranslationsTitle>{`missing ${props.selectedTopLevelLocale} values`}</MissingTranslationsTitle>
                </MissingTranslationsPill>
            )}
          </span>
        </RowTitle>
        <div style={{
        }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: -16,
              marginLeft: 24,
            }}
          >
            {commandMode == "edit" && (
              <>
                <DeleteVarContainer>
                  <DeleteVar src={editIcon} />
                </DeleteVarContainer>
                <DeleteVarContainer style={{marginRight: 24}}>
                  <DeleteVar src={trashIcon} />
                </DeleteVarContainer>
              </>
            )}
            <InputSelector
              hideLabel
              options={localeOptions}
              value={selectedLocaleCode ?? null}
              label={"locale"}
              placeholder={"locale"}
              size="shortest"
              onChange={(option) => {
                setSelectedLocaleCode(option?.value as string);
              }}
              maxHeight={800}
            />
          </div>
        </div>
      </TitleRow>
      <div style={{
        height: 56,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        {clientStorageIsEnabled && (
          <>
            <Checkbox isChecked={isPinned} onChange={onTogglePin}/>
            <span style={{marginLeft: 12}}>
              <PinPhrase>{'Keep Phrase Pinned'}</PinPhrase>
            </span>
          </>
        )}

      </div>
      <div>
        {selectedLocale && (
          <PhraseTranslation
            phrase={props.phrase}
            phraseRef={props.phraseRef}
            selectedLocale={selectedLocale}
            systemSourceLocale={systemSourceLocale}
            pinnedPhrases={props.pinnedPhrases}
            setPinnedPhrases={props.setPinnedPhrases}
            globalFilterUntranslated={props.globalFilterUntranslated}
            isPinned={isPinned}
          />
        )}
      </div>
      {false && (
        <div style={{
          width: '100%',
          marginTop: 24
        }}>
          <CreateTagsContainer tags={phrase?.tags ?? []} onUpdateTags={onUpdateTags}/>
        </div>
      )}
    </Container>
  );
};

export default React.memo(PhraseRow);
