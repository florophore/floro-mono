import React, {
  useCallback,
} from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const FilterUntranslated = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastTextLight};
  font-weight: 500;
  font-size: 1.4rem;
  padding: 0;
  margin-left: 12px;
  cursor: pointer;
`;

interface Props {
  selectedTopLevelLocale: string;
  globalFilterUntranslatedTerms: boolean;
  setGlobalFilterUnstranslatedTerms: (filter: boolean) => void;
}

const PhraseFilter = (props: Props) => {
  const theme = useTheme();

  const onToggleFilterUntranslatedTerms = useCallback(() => {
    props.setGlobalFilterUnstranslatedTerms(!props.globalFilterUntranslatedTerms);
  }, [props.globalFilterUntranslatedTerms])


  return (
    <Container>
        <Row
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingLeft: 24,
            paddingRight: 48,
            paddingTop: 48
          }}
        >
          <Row style={{marginTop: -12}}>
            <FilterUntranslated
              style={{
                marginLeft: 0,
                marginRight: 12,
                color: props.globalFilterUntranslatedTerms
                  ? theme.colors.warningTextColor
                  : theme.colors.contrastTextLight,
              }}
            >
              {`Filter un-translated (${props.selectedTopLevelLocale}) phrases for all groups`}
            </FilterUntranslated>
            <Checkbox
              isChecked={props.globalFilterUntranslatedTerms}
              onChange={onToggleFilterUntranslatedTerms}
            />
          </Row>
        </Row>
    </Container>
  )
};

export default React.memo(PhraseFilter);
