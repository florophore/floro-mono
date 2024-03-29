import React, { useMemo, useCallback, useState } from "react";

import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";

const CheckBoxContainer = styled.div`
  position: relative;
  display: inline-block;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  border-color: 2px solid ${(props) => props.theme.colors.checkboxFill};
  cursor: pointer;
`;

const HiddenCheckbox = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  outline: 0;
  opacity: 0;
`;

const CheckContainer = styled.div`
  top: 0;
  left: 0;
  position: absolute;
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const Circle = styled.div`
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: ${props => props.theme.colors.radioSelectFill};
`;

export interface Props {
  isChecked: boolean;
  disabled?: boolean;
  onChange: (isChecked: boolean) => void;
}

const Checkbox = (props: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const theme = useTheme();
  const onChangeCB = useCallback(() => {
    props?.onChange(!props.isChecked);
  }, [props?.onChange, props.isChecked]);

  const onKeyPressCB = useCallback((event: React.KeyboardEvent) => {
    if (event.code == "Enter") {
        props?.onChange(!props.isChecked);
    }
  }, [props?.onChange, props.isChecked]);

  const onFocusCB = useCallback(() => {
    setIsFocused(true);
  }, []);

  const onBlurCB = useCallback(() => {
    setIsFocused(false);
  }, []);

  const onStartHoverCB = useCallback(() => {
    setIsHovering(true);
  }, []);

  const onStopHoverCB = useCallback(() => {
    setIsHovering(false);
  }, []);

  const isDisabled = useMemo(() => props?.disabled ?? false, [props.disabled]);

  const border = useMemo(() => {
    if (isFocused || isHovering) {
      if (theme.name == "light") {
        return `2px solid ${ColorPalette.purple}`;
      }
      return `2px solid ${ColorPalette.lightPurple}`;
    }
    return `2px solid ${theme.colors.radioBorder}`;
  }, [theme.name, isFocused, isHovering]);

  return (
    <CheckBoxContainer style={{border}}>
      {props?.isChecked && (
        <CheckContainer>
          <Circle />
        </CheckContainer>
      )}
      <HiddenCheckbox
        style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
        type="checkbox"
        checked={props.isChecked}
        onChange={onChangeCB}
        onKeyDown={onKeyPressCB}
        disabled={isDisabled}
        onFocus={onFocusCB}
        onBlur={onBlurCB}
        onMouseEnter={onStartHoverCB}
        onMouseLeave={onStopHoverCB}
      />
    </CheckBoxContainer>
  );
};

export default React.memo(Checkbox);