import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette, { Opacity } from "@floro/styles/ColorPalette";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 32px;
  width: 190px;
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.toggleColor};
  border-radius: 8px;
  position: relative;
`;


const DisableOverlay = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  border-radius: 8px;
`;

const Option = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const OptionText = styled.div`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.1rem;
`;

export interface Props {
  value: string;
  leftOption: {
    label: string|React.ReactElement;
    value: string;
  };
  rightOption: {
    label: string|React.ReactElement;
    value: string;
  };
  isDisabled?: boolean;
  onChange: (value: string) => void;
}

const DualToggle = (props: Props) => {
  const theme = useTheme();
  const disabledBackground = useMemo(() => {
    if (theme.name == "dark") {
      return ColorPalette.gray.substring(0, 7) + Opacity[80];
    }
    return ColorPalette.lightGray.substring(0, 7) + Opacity[80];

  }, [theme.name]);

  const borderColor = useMemo(() => {
    if (props?.isDisabled) {
      if (theme.name == "light") {
        return ColorPalette.lightPurple;
      }
      return ColorPalette.darkPurple;
    }
    return theme.colors.toggleColor;
  }, [theme, props?.isDisabled]);

  const leftBackgrounColor = useMemo(() => {
    if (props.value != props.leftOption.value) {
      return theme.background;
    }
    return theme.colors.toggleColor;
  }, [theme, props.value, props.leftOption]);

  const leftColor = useMemo(() => {
    if (props.value == props.leftOption.value) {
      return ColorPalette.white;
    }
    return theme.colors.toggleColor;
  }, [theme, props.value, props.leftOption]);

  const rightBackgrounColor = useMemo(() => {
    if (props.value != props.rightOption.value) {
      return theme.background;
    }
    return theme.colors.toggleColor;
  }, [theme, props.value, props.rightOption]);

  const rightColor = useMemo(() => {
    if (props.value == props.rightOption.value) {
      return ColorPalette.white;
    }
    return theme.colors.toggleColor;
  }, [theme, props.value, props.rightOption]);

  const onClickLeft = useCallback(() => {
    if (props?.isDisabled) {
      return;
    }
    props.onChange(props.leftOption.value);
  }, [props.leftOption, props.onChange, props?.isDisabled]);

  const onClickRight = useCallback(() => {
    if (props?.isDisabled) {
      return;
    }
    props.onChange(props.rightOption.value);
  }, [props.rightOption, props.onChange, props?.isDisabled]);

  return (
    <Container style={{borderColor}}>
      <Option
        onClick={onClickLeft}
        style={{
          backgroundColor: leftBackgrounColor,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
        }}
      >
        <OptionText style={{ color: leftColor }}>
          {props.leftOption.label}
        </OptionText>
      </Option>
      <Option
        onClick={onClickRight}
        style={{
          backgroundColor: rightBackgrounColor,
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
        }}
      >
        <OptionText style={{ color: rightColor }}>
          {props.rightOption.label}
        </OptionText>
      </Option>
      {props?.isDisabled && (
        <DisableOverlay style={{background: disabledBackground, cursor: 'not-allowed'}}></DisableOverlay>
      )}
    </Container>
  );
};

export default React.memo(DualToggle);
