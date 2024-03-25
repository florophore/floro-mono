
import React, { useMemo, useCallback } from "react";
import {
  Organization,
  Plugin
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  width: 100%;
  border-radius: 8px;
  padding: 0 8px;
  cursor: pointer;
`;

const CenterInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 56px;
`;

const RightSide = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  height: 56px;
`;

const DisplayTitle = styled.h6`
  margin: 0;
  padding: 0;
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${props => props.theme.colors.contrastText};
`;

interface DocResult {
  title: string;
  path: string;
  article: string;

}

interface Props {
  docResult: DocResult;
  isSelected?: boolean;
}

const RepoSearchResultRow = (props: Props) => {
  const theme = useTheme();

  return (
    <Row style={{
        background: props.isSelected ? theme.colors.highlightedOptionBackgroundColor : theme.background
    }}>
      <CenterInfo>
        <DisplayTitle
          style={{
            color: props.isSelected
              ? theme.colors.linkColor
              : theme.colors.contrastText,
          }}
        >
          {props.docResult.title}
        </DisplayTitle>
      </CenterInfo>
      <RightSide></RightSide>
    </Row>
  );
};

export default React.memo(RepoSearchResultRow);