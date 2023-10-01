import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import {
  SchemaTypes,
  makeQueryRef,
  useFloroState,
  useQueryRef,
  useReferencedObject,
} from "../../floro-schema-api";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";

import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import TermValueTranslation from "./values/TermValueTranslation";
import TermNotesTranslation from "./values/TermNotesTranslation";

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

const OuterContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const HeaderWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h1`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.modalHeaderTitleColor};
  font-weight: 700;
  font-size: 2rem;
`;

interface Props {
  show: boolean;
  onDismiss: () => void;
  term: SchemaTypes["$(text).terms.id<?>"];
  selectedLocale?: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale?: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]|null;
}

const TermsModal = (props: Props) => {
  const theme = useTheme();
  const termRef = useQueryRef('$(text).terms.id<?>', props.term.id);

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismiss}
      disableBackgroundDismiss
      headerSize={"small"}
      topOffset={80}
      headerChildren={
        <HeaderWrapper>
          <HeaderTitle>{"view term"}</HeaderTitle>
        </HeaderWrapper>
      }
    >
      <OuterContainer>
        <div style={{width: '100%'}}>
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
          </RowTitle>
          <div
            style={{
              width: '100%',
              display: 'block'
            }}
          >
            {props.selectedLocale && (
              <TermValueTranslation
                term={props.term}
                selectedLocale={props.selectedLocale}
                systemSourceLocale={props.systemSourceLocale}
                termRef={termRef}
              />
            )}
          </div>
          <div
            style={{
              width: '100%',
              display: 'block'
            }}
          >
            {props.selectedLocale && (
              <TermNotesTranslation
                term={props.term}
                selectedLocale={props.selectedLocale}
                systemSourceLocale={props.systemSourceLocale}
                termRef={termRef}
              />
            )}
          </div>
        </div>
      </OuterContainer>
    </RootLongModal>
  );
};

export default React.memo(TermsModal);