import React, { useMemo, useCallback, useEffect } from "react";
import {
  PointerTypes,
  SchemaTypes,
  makeQueryRef,
  useFloroContext,
  useFloroState,
  useQueryRef,
  useReferencedObject,
} from "../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import ColorPalette from "@floro/styles/ColorPalette";
import TermTextEditor from "../TermTextEditor";
import SourceText from "../SourceText";

const Container = styled.div``;

const SourceContainer = styled.div`
  margin-top: 24px;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const RequiresRevision = styled.h1`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.warningTextColor};
  font-style: italic;
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
  background: ${(props) => props.theme.colors.warningTextColor};
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
  term: SchemaTypes["$(text).terms.id<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  termRef: PointerTypes["$(text).terms.id<?>"];
  pinnedTerms: Array<string> | null;
  setPinnedTerms: (phraseRegs: Array<string>) => void;
  globalFilterUntranslatedTerms: boolean;
  isPinned: boolean;
}

const TermValueTranslation = (props: Props) => {
  const theme = useTheme();
  const { commandMode } = useFloroContext();

  const localeRef = makeQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    props.selectedLocale.localeCode
  );

  const sourceLocaleRef = props?.systemSourceLocale?.localeCode
    ? makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        props.systemSourceLocale.localeCode
      )
    : (null as unknown as PointerTypes["$(text).localeSettings.locales.localeCode<?>"]);

  const sourceRef = sourceLocaleRef
    ? makeQueryRef(
        "$(text).terms.id<?>.localizedTerms.id<?>",
        props.term.id,
        sourceLocaleRef
      )
    : (null as unknown as PointerTypes["$(text).terms.id<?>.localizedTerms.id<?>"]);

  const sourceTermTranslation = useReferencedObject(sourceRef);

  const termTranslationRef = useQueryRef(
    "$(text).terms.id<?>.localizedTerms.id<?>",
    props.term.id,
    localeRef
  );

  const [termTranslation, setTermTranslation] =
    useFloroState(termTranslationRef);

  const contentIsEmpty = useMemo(() => {
    return (termTranslation?.termValue ?? "") == "";
  }, [termTranslation?.termValue]);

  const onSetContent = useCallback(
    (text: string) => {
      if (!termTranslation) {
        return;
      }
      setTermTranslation({
        ...termTranslation,
        termValue: text,
      }, true);
      if (
        contentIsEmpty &&
        props.globalFilterUntranslatedTerms &&
        !props.isPinned
      ) {
        props.setPinnedTerms([...(props?.pinnedTerms ?? []), props.termRef]);
      }
    },
    [
      termTranslation?.termValue,
      setTermTranslation,
      sourceTermTranslation,
      sourceRef,
      contentIsEmpty,
      props.isPinned,
      props.setPinnedTerms,
      props.pinnedTerms,
      props.termRef,
      props.globalFilterUntranslatedTerms,
    ]
  );

  //useEffect(() => {
  //  if (commandMode == "edit") {
  //    const timeout = setTimeout(() => {
  //      saveTermTranslation();
  //    }, 500);

  //    return () => {
  //      clearTimeout(timeout);
  //    }
  //  }
  //}, [termTranslation?.termValue, commandMode])

  return (
    <>
      <Container>
        <TitleRow style={{ marginBottom: 12, height: 40 }}>
          <RowTitle
            style={{
              fontWeight: 600,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span style={{ color: theme.colors.contrastText }}>
              {`Term Value (${props.selectedLocale.localeCode}):`}
            </span>
            <span>
              {contentIsEmpty && (
                <MissingTranslationsPill>
                  <MissingTranslationsTitle>{`missing ${props.selectedLocale.localeCode} term value`}</MissingTranslationsTitle>
                </MissingTranslationsPill>
              )}
            </span>
          </RowTitle>
        </TitleRow>
        <TermTextEditor
          value={termTranslation?.termValue ?? ""}
          onUpdateValue={onSetContent}
          isReadOnly={commandMode != "edit"}
          placeholder={`write translation for value (default to "${props?.term?.name}")`}
          label={`(${props.selectedLocale.localeCode}) value`}
        />
      </Container>
      {props.systemSourceLocale && sourceTermTranslation && (
        <SourceContainer>
          <TitleRow style={{ marginBottom: 12, height: 40 }}>
            <RowTitle
              style={{
                fontWeight: 600,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <span style={{ color: theme.colors.contrastText }}>
                {`Source Term Value (${props.systemSourceLocale.localeCode}):`}
              </span>
            </RowTitle>
          </TitleRow>
          <SourceText
            lang={props.systemSourceLocale.localeCode?.toLowerCase() ?? "en"}
            content={sourceTermTranslation?.termValue ?? ""}
            isSource
          />
        </SourceContainer>
      )}
    </>
  );
};

export default React.memo(TermValueTranslation);
