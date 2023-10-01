import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  PointerTypes,
  SchemaTypes,
  makeQueryRef,
  useClientStorageApi,
  useExtractQueryArgs,
  useFloroContext,
  useFloroState,
  useReferencedObject,
} from "../../floro-schema-api";
import { Reorder, useDragControls } from "framer-motion";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import DraggerLight from "@floro/common-assets/assets/images/icons/dragger.light.svg";
import DraggerDark from "@floro/common-assets/assets/images/icons/dragger.dark.svg";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import ColorPalette from "@floro/styles/ColorPalette";

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";

import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
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

const TermWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-top: 12px;
  margin-right: 12px;
`;

const TermSpan = styled.span`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.linkColor};
  text-decoration: underline;
  margin-right: 8px;
  margin-top: -2px;
  cursor: pointer;
`;

const TermIcon = styled.img`
  height: 24px;
  width: 24px;
`;

interface Props {
  terms: Array<{
    id: string;
    value: string;
    name: string;
  }>;
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale?: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]|null;
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
            props.enabledTerms?.includes(mentionedTerm?.id) ??
            false;
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
