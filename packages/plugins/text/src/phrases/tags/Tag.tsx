import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  SchemaTypes,
  useFloroContext,
  useReferencedObject,
} from "../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import ColorPalette from "@floro/styles/ColorPalette";
import XWhite from "@floro/common-assets/assets/images/icons/x_cross.white.svg";

const PillContainer = styled.div`
  height: 32px;
  background: ${(props) => props.theme.colors.titleText};
  margin-left: 8px;
  margin-right: 8px;
  margin-top: 4px;
  margin-bottom: 4px;
  border-radius: 16px;
  padding: 4px 16px 4px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
`;

const PillText = styled.span`
  padding: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${ColorPalette.white};
`;

const TermIcon = styled.img`
  margin-top: 2px;
  margin-left: 8px;
  height: 16px;
  width: 16px;
  cursor: pointer;
`;

interface Props {
  tag: string;
  index: number;
  onRemove: (index: number) => void;
}

const Tag = (props: Props) => {
  const { commandMode } = useFloroContext();

  const onRemove = useCallback(() => {
    props.onRemove(props.index);
  }, [props.index, props.onRemove])

  return (
    <>
      <PillContainer>
        <PillText>{props.tag}</PillText>
        {commandMode == "edit" && (
            <>
                <TermIcon onClick={onRemove} src={XWhite}/>
            </>
        )}
      </PillContainer>
    </>
  );
};

export default React.memo(Tag);
