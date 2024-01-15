import React, { useEffect, useState, useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";

import CrossLight from "@floro/common-assets/assets/images/icons/cross.light.svg";
import CrossDark from "@floro/common-assets/assets/images/icons/cross.dark.svg";

const OuterContainer = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  position: absolute;
  padding: 24px;
  z-index: 4;
  transition: opacity 300ms;
  background: ${props => props.theme.background};
  height: calc(100% - 72px);
  overflow-y: scroll;
  padding-top: 100px;
  padding-bottom: 120px;
  box-sizing: border-box;
  padding-left: 24px;
  padding-right: 48px;
`;

const ScrollContainer = styled.div`

`;

interface Props {
  children: React.ReactElement;
  show: boolean;
}

const FocusView = (props: Props) => {
  const theme = useTheme();

  const crossIcon = useMemo(() => {
    if (theme.name == "light") {
      return CrossLight;
    }
    return CrossDark;

  }, [theme.name])

  return (
    <OuterContainer
      style={{
        opacity: props.show ? 1 : 0,
        pointerEvents: props.show ? "all" : "none",
      }}
    >
      <ScrollContainer>
        {props.children}
      </ScrollContainer>
    </OuterContainer>
  );
};

export default React.memo(FocusView);
