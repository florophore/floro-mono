import React, { useMemo } from "react";
import {
  PointerTypes,
  SchemaTypes,
  makeQueryRef,
  useFloroContext,
  useQueryRef,
  useReferencedObject,
} from "../../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import TermTextEditor from "../../../terms/TermTextEditor";

const Container = styled.div`
  margin-top: 24px;
  width: 100%;
`;

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

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

interface Props {
  term: SchemaTypes["$(text).terms.id<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale?:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  termRef: PointerTypes["$(text).terms.id<?>"];
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

  const termTranslation = useReferencedObject(termTranslationRef);
  console.log(sourceTermTranslation);

  const contentIsEmpty = useMemo(() => {
    return (termTranslation?.termValue ?? "") == "";
  }, [termTranslation?.termValue]);

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
              {`Term Notes (${props.selectedLocale.localeCode}):`}
            </span>
          </RowTitle>
        </TitleRow>
        <TermTextEditor
          value={termTranslation?.localNotes ?? ""}
          onUpdateValue={() => {}}
          isReadOnly
          placeholder={"no notes"}
          label={`(${props.selectedLocale.localeCode}) notes`}
          maxHeight={60}
        />
      </Container>
      {props.systemSourceLocale &&
        sourceTermTranslation &&
        props.systemSourceLocale?.name != props.selectedLocale?.name && (
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
                  {`Source Term Notes (${props.systemSourceLocale.localeCode}):`}
                </span>
              </RowTitle>
            </TitleRow>
            <TermTextEditor
              value={sourceTermTranslation?.localNotes ?? ""}
              onUpdateValue={() => {}}
              isReadOnly
              placeholder={"no notes"}
              label={`(${
                props.systemSourceLocale.localeCode?.toLowerCase() ?? "en"
              }) notes`}
              maxHeight={60}
            />
          </SourceContainer>
        )}
    </>
  );
};

export default React.memo(TermValueTranslation);
