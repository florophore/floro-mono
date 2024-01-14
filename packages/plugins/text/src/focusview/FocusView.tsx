
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import styled from "@emotion/styled";

const OuterContainer = styled.div`
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  position: fixed;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #FF000080;
  z-index: 4;
  pointer-events: none;
`;

interface Props {

}

const FocusView = (props: Props) => {
    return (
        <OuterContainer>

        </OuterContainer>
    )
}

export default React.memo(FocusView);