import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { PointerTypes, SchemaTypes, makeQueryRef, useCopyApi, useFloroContext, useHasIndication, useReferencedObject } from "../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import ColorPalette from "@floro/styles/ColorPalette";

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";

import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import TermValueTranslation from "./values/TermValueTranslation";
import TermNotesTranslation from "./values/TermNotesTranslation";
import UpdateTermModal from "./UpdateTermModal";
import { useDiffColor } from "../diff";
import { getTermIsUntranslated } from "./termfilterhooks";
import Button from "@floro/storybook/stories/design-system/Button";

const Container = styled.div`
  padding: 0;
  margin-bottom: 8px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  padding: 18px 16px;
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
  min-height: 24px;
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
  term: SchemaTypes["$(text).terms.id<?>"];
  termRef: PointerTypes["$(text).terms.id<?>"];
  index: number;
  selectedTopLevelLocale: string;
  pinnedTerms: Array<string>|null;
  setPinnedTerms: (phraseRegs: Array<string>) => void;
  globalFilterUntranslatedTerms: boolean;
  onRemove: (phrase: SchemaTypes["$(text).terms.id<?>"]) => void;
  scrollContainer: HTMLDivElement;
  selectedTerm: string|null;
  showFilters: boolean;
  onSetDismissedUnTranslated: (id: string) => void;
}

const TermRow = (props: Props) => {
  const theme = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const locales = useReferencedObject("$(text).localeSettings.locales");
  const {
    applicationState,
    commandMode,
    clientStorage,
    isCopyMode,
    changeset,
    conflictSet,
  } = useFloroContext();
  const clientStorageIsEnabled = clientStorage != null;
  const [selectedLocaleCode, setSelectedLocaleCode] = useState(props.selectedTopLevelLocale);
  const localeSettings = useReferencedObject("$(text).localeSettings");
  //const term = useReferencedObject(props.termRef);
  const selectedLocale = useMemo(
    () =>
      localeSettings.locales.find((l) => l.localeCode == selectedLocaleCode),
    [localeSettings.locales, selectedLocaleCode]
  );

  const {isCopied, toggleCopy} = useCopyApi(props.termRef);
  const hasIndications = useHasIndication(props.termRef)

  const indicatedLocales = useMemo(() => {
    if (!hasIndications) {
      return [];
    }
    return locales.filter(locale => {
      const localeRef = makeQueryRef("$(text).localeSettings.locales.localeCode<?>", locale?.localeCode);
      const phraseLocaleRef = `${props.termRef}.localizedTerms.id<${localeRef}>`;
      return changeset?.has?.(phraseLocaleRef) || conflictSet?.has?.(phraseLocaleRef);
    })
  }, [hasIndications, conflictSet, changeset, props.termRef, locales]);

  const showAllTranslated = useMemo(() => {
    if (commandMode != "edit") {
      return false;
    }
    if (!props.globalFilterUntranslatedTerms) {
      return false;
    }
    if (!props.term || !applicationState) {
      return false;
    }
    const localeRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      selectedLocale?.localeCode ?? (props.selectedTopLevelLocale as string)
    );
    return !getTermIsUntranslated(props.term, localeRef);
  }, [
    applicationState,
    props.globalFilterUntranslatedTerms,
    commandMode,
    props.term,
    selectedLocale?.localeCode ?? props.selectedTopLevelLocale,
  ]);

  const indicatedLocaleCodes = useMemo(() => {
    return indicatedLocales?.map(l => l.localeCode).join(", ");
  }, [indicatedLocales]);

  const diffColor = useDiffColor(props.termRef, true, 'darker');

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

  const hasUnTranslatedParts = useMemo(() => {
    const localeRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      selectedLocale?.localeCode ?? props.selectedTopLevelLocale
    );
    const termValue = props.term?.localizedTerms.find(
      (p) => p.id == localeRef
    );
    if ((termValue?.termValue ?? "") == "") {
      return true;
    }
    return false;
  }, [applicationState, props.term, props.selectedTopLevelLocale, selectedLocale?.localeCode]);


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
    return props.pinnedTerms?.includes(props.termRef) ?? false;
  }, [props.pinnedTerms, props.termRef, clientStorage]);

  const onTogglePin = useCallback(() => {
    if (props.pinnedTerms?.includes(props.termRef)) {
      props.setPinnedTerms(props.pinnedTerms.filter(p => p != props.termRef))
    } else {
      props.setPinnedTerms([...(props.pinnedTerms ?? []), props.termRef]);
    }

  }, [isPinned, props.setPinnedTerms, props.pinnedTerms, props.termRef])

  const onRemove = useCallback(() => {
    props?.onRemove(props.term);
  }, [props.onRemove, props.term])

  const [showUpdate, setShowUpdate] = useState(false);

  const onShowUpdate = useCallback(() => {
    setShowUpdate(true);
  }, []);

  const onHideUpdate = useCallback(() => {
    setShowUpdate(false);
  }, []);

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowContent(true);
    }, 100);
    return () => {
      clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    if (!props?.scrollContainer) {
      return;
    }
    if (props.selectedTerm == props.termRef) {
      if (container.current) {
        const filtersAdjust = props.showFilters ? 132 : 0;
        props.scrollContainer.scrollTo({
          left: 0,
          top: container.current.offsetTop - (236 + filtersAdjust),
          behavior: "smooth",
        });
      }
    }
  }, [
    props?.scrollContainer,
    props.selectedTerm,
  ]);

  if (!showContent) {
    return null;
  }

  if (commandMode == "compare" && !hasIndications) {
    return null;
  }

  return (
    <Container ref={container} style={{borderColor: diffColor}}>
      <UpdateTermModal
        show={showUpdate}
        onDismiss={onHideUpdate}
        term={props.term}
      />
      <TitleRow>
        <RowTitle
          style={{
            fontWeight: 600,
            marginTop: 0,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <span style={{ color: theme.colors.contrastText }}>{"Term: "}</span>
          <span style={{ color: theme.colors.titleText, marginLeft: 8 }}>
            {props.term.name}
          </span>
          <span>
            {hasUnTranslatedParts && (
              <MissingTranslationsPill>
                <MissingTranslationsTitle>{`missing ${
                  selectedLocale?.localeCode ?? props.selectedTopLevelLocale
                } values`}</MissingTranslationsTitle>
              </MissingTranslationsPill>
            )}
          </span>
        </RowTitle>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: -16,
              marginLeft: 24,
            }}
          >
            {commandMode == "edit" && (
              <>
                <DeleteVarContainer>
                  <DeleteVar onClick={onShowUpdate} src={editIcon} />
                </DeleteVarContainer>
                <DeleteVarContainer style={{ marginRight: 24 }}>
                  <DeleteVar src={trashIcon} onClick={onRemove} />
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
      {hasIndications && (
        <div
          style={{
            height: 56,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
            <span style={{ marginLeft: 0 }}>
              <PinPhrase style={{fontWeight: 700, fontSize: '1.4rem', color: diffColor}}>{"Changed Locales: " + indicatedLocaleCodes}</PinPhrase>
            </span>
        </div>
      )}
      <div
        style={{
          height: 56,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {clientStorageIsEnabled && (
          <>
            <Checkbox isChecked={isPinned} onChange={onTogglePin} />
            <span style={{ marginLeft: 12 }}>
              <PinPhrase>{"Keep Term Pinned"}</PinPhrase>
            </span>
          </>
        )}
      </div>
      {isCopyMode && (
        <div
          style={{
            height: 56,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Checkbox isChecked={isCopied} onChange={toggleCopy} />
          <span style={{ marginLeft: 12 }}>
            <PinPhrase>{"Copy Term"}</PinPhrase>
          </span>
        </div>
      )}

      {commandMode == "edit" && showAllTranslated && (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            {clientStorageIsEnabled && (
              <div
                style={{
                  height: 56,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: 250,
                }}
              >
                <PinPhrase
                  style={{ color: theme.colors.warningTextColor }}
                >
                  {"All translated "}
                </PinPhrase>
                <div style={{ marginLeft: 12, width: 80 }}>
                  <Button
                    onClick={() => {
                      if (!props?.term.id) {
                        return;
                      }
                      props.onSetDismissedUnTranslated(props?.term.id);
                    }}
                    label={"dismiss"}
                    bg={"orange"}
                    size={"extra-small"}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div style={{ marginTop: 24 }}>
        {selectedLocale && (
          <TermValueTranslation
            term={props.term}
            selectedLocale={selectedLocale}
            systemSourceLocale={systemSourceLocale}
            termRef={props.termRef}
            pinnedTerms={props.pinnedTerms}
            setPinnedTerms={props.setPinnedTerms}
            globalFilterUntranslatedTerms={props.globalFilterUntranslatedTerms}
            isPinned={isPinned}
          />
        )}
      </div>
      <div style={{ marginTop: 24 }}>
        {selectedLocale && (
          <TermNotesTranslation
            term={props.term}
            selectedLocale={selectedLocale}
            systemSourceLocale={systemSourceLocale}
            termRef={props.termRef}
            pinnedTerms={props.pinnedTerms}
            setPinnedTerms={props.setPinnedTerms}
            globalFilterUntranslatedTerms={props.globalFilterUntranslatedTerms}
            isPinned={isPinned}
          />
        )}
      </div>
    </Container>
  );
};

export default React.memo(TermRow);
