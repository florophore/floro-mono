import React from 'react';
import styled from "@emotion/styled";

const Container = styled.div`
  width: 396px;
  position: relative;
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  box-sizing: border-box;
  box-shadow: 0 10px 10px 1px ${props => props.theme.colors.tooltipOuterShadowColor};
  display: flex;
`;

const InnerShadow = styled.div`
  background: ${props => props.theme.background};
  padding: 16px;
  box-shadow: inset 0 0 3px ${props => props.theme.colors.tooltipInnerShadowColor};
  border-radius: 8px;
  flex-grow: 1;
  overflow-y: scroll;
`;

export interface Props {
    children?: React.ReactElement;
}

const SearchDropdown = (props: Props) => {

    return (
        <Container>
            <InnerShadow>
                {props.children}
            </InnerShadow>
        </Container>
    );
}

export default React.memo(SearchDropdown);