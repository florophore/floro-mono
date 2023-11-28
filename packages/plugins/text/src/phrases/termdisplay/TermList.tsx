import React from "react";
import { SchemaTypes } from "../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import Term from "./Term";
import Button from "@floro/storybook/stories/design-system/Button";

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
  isEmpty?: boolean;
  onChange?: (termId: string) => void;
  enabledTerms: string[];
  title?: React.ReactElement;
  showFindTerms?: boolean;
  onShowFindTerms?: () => void;
}

const TermList = (props: Props) => {
  const theme = useTheme();
  if ((!props.showFindTerms && props?.terms?.length == 0) || props?.isEmpty) {
    return null;
  }
  return (
    <>
      <RowTitle
        style={{
          marginTop: 12,
          fontWeight: 600,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: 'space-between'
        }}
      >
        <div>
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
        </div>
        {props.showFindTerms && (
          <Button
            label={`Find Terms`}
            bg={"teal"}
            size={"small"}
            textSize="small"
            onClick={props.onShowFindTerms}
          />

        )}
      </RowTitle>
      {props.terms.length > 0 && (
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

      )}
    </>
  );
};

export default React.memo(TermList);
