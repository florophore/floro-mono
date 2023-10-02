import React from "react";
import { SchemaTypes } from "../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import Term from "./Term";

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const TermContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 12px;
`;

interface Props {
  terms: Array<{
    id: string;
    value: string;
    name: string;
  }>;
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale?:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  isReadOnly?: boolean;
  onChange?: (termId: string) => void;
  enabledTerms: string[];
  title?: React.ReactElement;
}

const TermList = (props: Props) => {
  const theme = useTheme();

  return (
    <>
      <RowTitle
        style={{
          marginTop: 12,
          fontWeight: 600,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {!props.isReadOnly && (
          <span style={{ color: theme.colors.contrastText }}>
            {props.title}
          </span>
        )}
        {props.isReadOnly && props?.systemSourceLocale && (
          <span style={{ color: theme.colors.contrastText }}>
            {props.title}
          </span>
        )}
      </RowTitle>
      <TermContainer>
        {props.terms.map((mentionedTerm, index) => {
          const isEnabled =
            props.enabledTerms?.includes(mentionedTerm?.id) ?? false;
          return (
            <Term
              key={index}
              isEnabled={isEnabled}
              selectedLocale={props.selectedLocale}
              systemSourceLocale={props.systemSourceLocale}
              term={mentionedTerm}
              isReadOnly={props.isReadOnly}
              onChange={props.onChange}
              enabledTerms={props.enabledTerms}
            />
          );
        })}
      </TermContainer>
    </>
  );
};

export default React.memo(TermList);
